// One device/pipeline is shared by the short-lived reveal canvases.
let renderer;
const shader = `
struct Vertex { @builtin(position) position: vec4f, @location(0) uv: vec2f }
@vertex fn vertex(@builtin(vertex_index) i: u32) -> Vertex {
  let p = array<vec2f, 3>(vec2f(-1., -1.), vec2f(3., -1.), vec2f(-1., 3.));
  var out: Vertex;
  out.position = vec4f(p[i], 0., 1.);
  out.uv = p[i] * vec2f(.5, -.5) + .5;
  return out;
}
@group(0) @binding(0) var image: texture_2d<f32>;
@group(0) @binding(1) var imageSampler: sampler;
@group(0) @binding(2) var<uniform> state: vec4f;
fn noise(p: vec2f) -> f32 { return fract(sin(dot(p, vec2f(12.9898, 78.233))) * 43758.5453); }
@fragment fn fragment(in: Vertex) -> @location(0) vec4f {
  let uv = (in.uv - .5) * state.yz + .5;
  if (any(uv < vec2f(0.)) || any(uv > vec2f(1.))) { return vec4f(0.); }
  let frost = smoothstep(state.x - .22, state.x + .22, 1. - in.uv.y);
  let grain = noise(in.position.xy);
  let radius = frost * .025;
  var color = vec4f(0.);
  for (var i = 0; i < 16; i++) {
    let angle = f32(i) * 2.399963 + grain * 6.283185;
    let offset = vec2f(cos(angle), sin(angle)) * sqrt((f32(i) + .5) / 16.) * radius;
    color += textureSampleLevel(image, imageSampler, uv + offset, 0.);
  }
  color /= 16.;
  let veil = frost * .22;
  color = vec4f(mix(color.rgb, vec3f(.88), veil) + (grain - .5) * frost * .09, color.a);
  return vec4f(color.rgb * color.a, color.a);
}`;
async function getRenderer() {
  if (!navigator.gpu) return null;
  renderer ??= (async () => {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return null;
    const device = await adapter.requestDevice();
    device.lost.then(() => { renderer = undefined; });
    const format = navigator.gpu.getPreferredCanvasFormat();
    const module = device.createShaderModule({ code: shader });
    const pipeline = await device.createRenderPipelineAsync({
      layout: 'auto', vertex: { module, entryPoint: 'vertex' },
      fragment: { module, entryPoint: 'fragment', targets: [{ format }] },
      primitive: { topology: 'triangle-list' },
    });
    return { device, format, pipeline };
  })().catch(() => null);
  return renderer;
}

export function observeFrost(image) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false;
  let frame = 0;
  let fallback;
  let release = () => {};
  const stop = () => {
    cancelAnimationFrame(frame);
    fallback?.cancel();
    release();
  };
  const reveal = async () => {
    observer.disconnect();
    if (motion.matches) return;
    try {
      await image.decode();
      if (disposed || motion.matches) return;
      // Start immediately; unsupported GPUs retain this same clear-glass entrance.
      fallback = image.animate([
        { filter: 'blur(16px)', opacity: .45 },
        { filter: 'blur(0px)', opacity: 1 },
      ], { duration: 1100, easing: 'cubic-bezier(.22,1,.36,1)' });
      const gpu = await getRenderer();
      if (!gpu || disposed || motion.matches || fallback.playState === 'finished') return;
      const { device, format, pipeline } = gpu;
      const canvas = document.createElement('canvas');
      canvas.className = 'ed-frost-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      const context = canvas.getContext('webgpu');
      if (!context) return;
      const rect = image.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.configure({ device, format, alphaMode: 'premultiplied' });
      const texture = device.createTexture({
        size: [image.naturalWidth, image.naturalHeight], format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      });
      const uniform = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      release = () => { canvas.remove(); context.unconfigure(); texture.destroy(); uniform.destroy(); };
      device.queue.copyExternalImageToTexture({ source: image }, { texture }, [image.naturalWidth, image.naturalHeight]);
      const bindings = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [
        { binding: 0, resource: texture.createView() },
        { binding: 1, resource: device.createSampler({ magFilter: 'linear', minFilter: 'linear' }) },
        { binding: 2, resource: { buffer: uniform } },
      ] });
      const imageAspect = image.naturalWidth / image.naturalHeight;
      const boxAspect = rect.width / rect.height;
      const contain = getComputedStyle(image).objectFit === 'contain';
      const scaleX = contain ? Math.max(1, boxAspect / imageAspect) : Math.min(1, boxAspect / imageAspect);
      const scaleY = contain ? Math.max(1, imageAspect / boxAspect) : Math.min(1, imageAspect / boxAspect);
      const start = performance.now();
      const draw = (time) => {
        if (disposed || motion.matches || !image.isConnected) { stop(); return; }
        const progress = Math.min((time - start) / 1100, 1);
        try {
          device.queue.writeBuffer(uniform, 0, new Float32Array([progress * 1.44 - .22, scaleX, scaleY, 0]));
          const encoder = device.createCommandEncoder();
          const pass = encoder.beginRenderPass({ colorAttachments: [{
            view: context.getCurrentTexture().createView(), clearValue: [0, 0, 0, 0], loadOp: 'clear', storeOp: 'store',
          }] });
          pass.setPipeline(pipeline); pass.setBindGroup(0, bindings); pass.draw(3); pass.end();
          device.queue.submit([encoder.finish()]);
          if (!canvas.isConnected) image.parentElement.append(canvas);
          if (progress < 1) frame = requestAnimationFrame(draw);
          else stop();
        } catch { stop(); }
      };
      fallback.cancel();
      frame = requestAnimationFrame(draw);
      device.lost.then(stop);
    } catch { stop(); }
  };
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) void reveal();
  }, { threshold: .15 });
  observer.observe(image);
  const onMotion = () => { if (motion.matches) stop(); };
  motion.addEventListener('change', onMotion);
  return () => { disposed = true; observer.disconnect(); motion.removeEventListener('change', onMotion); stop(); };
}

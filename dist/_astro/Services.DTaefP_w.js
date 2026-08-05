import{j as e}from"./jsx-runtime.u17CrQMm.js";import{a as m,R as u}from"./index.CgHfCimL.js";import{g as d}from"./index.DDlvirwQ.js";import{S as g}from"./ScrollTrigger.CB6UHAJl.js";d.registerPlugin(g);const x=[{title:"Strategy",imageKey:"strategy",imageAlt:"Strategy service visual",tags:["Research","Positioning","Audience","Messaging"],desc:"Understanding where your business stands today, where it belongs tomorrow, and how to close the gap with clarity."},{title:"Identity",imageKey:"identity",imageAlt:"Identity service visual",tags:["Visual Identity","Verbal Identity","Art Direction","Design System","Guidelines"],desc:"Creating identities that feel distinct, consistent, and built to last across every touchpoint."},{title:"Digital",imageKey:"digital",imageAlt:"Digital service visual",tags:["Websites","Content","Performance","SEO","Analytics","Growth"],desc:"Turning strategy into digital experiences that build trust and support long-term growth."}];function w(){return e.jsxs("span",{className:"relative flex h-2 w-2",children:[e.jsx("span",{className:`
          absolute inline-flex h-full w-full rounded-full
          bg-red-500
          opacity-0
          group-hover:opacity-60
          group-hover:animate-ping
          motion-reduce:group-hover:animate-none
        `}),e.jsx("span",{className:`
          relative inline-flex h-2 w-2 rounded-full
          bg-red-500
          opacity-40
          transition-all duration-300 ease-out
          group-hover:opacity-100
          group-hover:shadow-[0_0_10px_rgba(239,68,68,0.85)]
        `})]})}function f({src:t,alt:a,className:s=""}){return e.jsx("div",{className:`relative isolate aspect-square w-full overflow-hidden rounded-lg bg-[#FFFF04] ${s}`,children:e.jsx("img",{src:t.src,srcSet:t.srcSet,alt:a,width:t.width,height:t.height,loading:"lazy",decoding:"async",className:"h-full w-full object-cover"})})}function v({tags:t,className:a=""}){return e.jsx("div",{className:`flex flex-wrap gap-2 ${a}`,children:t.map(s=>e.jsx("span",{className:"text-[11px] px-3 py-1 rounded-full bg-white/10 text-white/60 border border-white/10",children:s},s))})}function y({item:t,isLast:a,image:s}){return e.jsxs("div",{className:"group w-full",children:[e.jsxs("div",{className:`
          grid grid-cols-1 gap-4
          md:pt-6 md:gap-x-10 md:gap-y-6 md:grid-cols-[minmax(0,1fr)_180px]
          xl:grid-cols-[220px_minmax(0,1fr)_180px]
          items-start content-start
        `,children:[e.jsx("div",{className:"order-1 md:col-start-1 md:row-start-1 xl:col-start-1 xl:row-start-1",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(w,{}),e.jsx("h3",{className:"text-white text-2xl lg:text-3xl font-semibold",children:t.title})]})}),e.jsx(v,{tags:t.tags,className:"order-2 mt-1 md:mt-3 md:col-start-1 md:row-start-2 xl:mt-0 xl:col-start-2 xl:row-start-2"}),e.jsx("p",{className:`
            order-3 mt-3
            text-white/80 md:text-white/60
            text-sm leading-relaxed
            md:order-2 md:mt-0 md:col-start-1 md:row-start-3
            xl:col-start-2 xl:row-start-1 2xl:max-w-90
          `,children:t.desc}),e.jsx("div",{className:`
            order-4 mt-2 w-full
            md:order-3 md:mt-0 md:w-[180px] md:justify-self-end md:col-start-2 md:row-start-1 md:row-span-3
            xl:col-start-3 xl:row-start-1
          `,children:e.jsx(f,{src:s,alt:t.imageAlt,className:"w-full md:w-[180px]"})})]}),!a&&e.jsx("div",{className:"mt-8 lg:mt-10 border-t border-white/10"})]})}const T=({serviceImages:t})=>{const a=m.useRef(null),s=m.useRef(null);return m.useLayoutEffect(()=>{const r=a.current,i=s.current;if(!r||!i)return;const o=typeof window<"u"&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,p=d.context(()=>{const c=i.querySelectorAll("[data-services-heading-word]");if(!c.length)return;if(o){d.set(c,{yPercent:0,opacity:1,clearProps:"transform"});return}const l=d.matchMedia(),n=h=>{d.timeline({defaults:{ease:"power4.inOut"},scrollTrigger:{trigger:r,start:h,toggleActions:"play none none reverse"}}).fromTo(c,{yPercent:110,opacity:0},{yPercent:0,opacity:1,duration:.65,stagger:.23,ease:"power3.out"})};return l.add("(max-width: 639px)",()=>n("top 90%")),l.add("(min-width: 640px) and (max-width: 767px)",()=>n("top 78%")),l.add("(min-width: 768px) and (max-width: 1023px)",()=>n("top 90%")),l.add("(min-width: 1024px) and (max-width: 1279px)",()=>n("top 50%")),l.add("(min-width: 1280px) and (max-width: 1535px)",()=>n("top 58%")),l.add("(min-width: 1536px)",()=>n("top 46%")),g.refresh(),()=>l.revert()},r);return()=>p.revert()},[]),e.jsx("div",{id:"services",ref:a,className:"w-full px-2 sm:px-4 pt-12 sm:pt-24 flex flex-col bg-backgroundlight",children:e.jsxs("div",{className:"flex w-full flex-col overflow-hidden rounded-3xl bg-black lg:flex-row",children:[e.jsxs("div",{className:"flex w-full flex-col justify-start p-6 md:p-10 lg:w-2/5 2xl:w-3/5",children:[e.jsx("span",{className:"text-sm md:text-xl font-medium text-white",children:"[SERVICES]"}),e.jsx("div",{className:"flex-1 flex md:mt-10",children:e.jsx("h2",{ref:s,className:"pt-6 text-4xl font-bold leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl md:pt-8 md:text-[clamp(2.5rem,6vw,4rem)] md:whitespace-nowrap lg:text-6xl lg:whitespace-normal xl:text-8xl","aria-label":"STRATEGY. IDENTITY. DIGITAL.",children:["STRATEGY.","IDENTITY.","DIGITAL."].map((r,i,o)=>e.jsxs(u.Fragment,{children:[e.jsx("span",{className:"inline-block overflow-hidden align-bottom",children:e.jsx("span",{"data-services-heading-word":!0,className:"inline-block will-change-transform",children:r})}),i<o.length-1?" ":null]},r))})})]}),e.jsxs("div",{className:"w-full p-6 md:p-10 flex flex-col",children:[e.jsx("div",{className:"border-t border-white/10 mb-6 md:hidden"}),x.map((r,i)=>e.jsx(y,{item:r,image:t[r.imageKey],isLast:i===x.length-1},i))]})]})})};export{T as default};

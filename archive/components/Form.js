import React from "react";

const Form = () => {
  return (
    <section className="w-[70vw] px-4 pt-24 flex flex-col bg-backgroundlight">
      <div className="w-full rounded-3xl overflow-hidden h-screen bg-[#f6f44a] text-black">
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 p-8 lg:p-12">
          {/* Left */}
          <div className="flex flex-col gap-10">
            <div className="h-6 w-6 rounded-full bg-black/80" />

            <div>
              <h1 className="font-bold leading-[0.95] tracking-[-0.03em] text-[clamp(2.5rem,4.6vw,4.6rem)]">
                Rizk moves fast,
                <br />
                moves faster
                <br />
                with formrizk
              </h1>
            </div>

            <div className="max-w-md">
              <p className="text-lg font-semibold leading-snug">
                “Super smooth experience.”
                <br />
                “Everything was fast, clear, and hassle-free. I got what I needed in minutes.”
              </p>
              <p className="mt-3 text-sm font-semibold">
                — Alex R., Verified Customer
              </p>
            </div>

            <div className="mt-auto text-sm font-semibold">
              web design, web development
              <br />
              and creative development
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col justify-center">
            <form className="flex flex-col gap-8 max-w-xl">
              <label className="flex flex-col gap-2 text-lg font-semibold">
                Type your message here
                <textarea
                  rows={1}
                  className="bg-transparent border-b-2 border-black/80 focus:outline-none resize-none"
                />
              </label>

              <label className="flex flex-col gap-2 text-lg font-semibold">
                Your name
                <input className="bg-transparent border-b-2 border-black/80 focus:outline-none" />
              </label>

              <label className="flex flex-col gap-2 text-lg font-semibold">
                You@email.com
                <input className="bg-transparent border-b-2 border-black/80 focus:outline-none" />
              </label>

              <label className="flex flex-col gap-2 text-lg font-semibold">
                Tell me a little about your project
                <input className="bg-transparent border-b-2 border-black/80 focus:outline-none" />
              </label>

              <button
                type="button"
                className="mt-4 w-full rounded-full bg-black text-white text-lg font-semibold py-4"
              >
                Let&apos;s goooooo!!
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Form;

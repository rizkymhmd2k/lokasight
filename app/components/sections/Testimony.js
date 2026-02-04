import React from "react";

const Testimony = () => {
  return (
    <div className="w-full px-4 pt-25 flex flex-col bg-backgroundlight">
      <div className="bg-yellow1 w-full rounded-3xl overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT MAIN */}
        <div className="w-full lg:w-3/5 2xl:w-4/5 flex flex-col p-6 lg:p-10 border border-red-600">
          <span className="text-sm md:text-xl font-medium">[services]</span>

          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-[-0.04em] pt-6 lg:pt-8 leading-[0.95]">
            DON&apos;T BELIEVE US?
          </h1>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-[-0.02em] pt-6 lg:pt-8 leading-tight opacity-80">
            {/* placeholder */}
            Hear it from the people who worked with us honest feedback, real
            results, no fluff.
          </h2>
        </div>

        {/* RIGHT SERVICES */}
        <div className="w-full p-6 lg:p-10 flex flex-col border border-blue-700">
        </div>
      </div>
    </div>
  );
};

export default Testimony;

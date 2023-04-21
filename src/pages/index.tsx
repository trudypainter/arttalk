import { type NextPage } from "next";
import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import TopFeedback from "~/components/TopFeedback";
import { FIRST_FEEDBACK } from "~/constants/constant";
import CanvasWithCircle from "~/components/CanvasWithMousePos";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Art Talk</title>
        <meta name="description" content="Final project for 6.8510" />
        <link rel="icon" href="/fav.ico" />
      </Head>

      <main className="flex w-full  justify-center  space-x-8 pt-12">
        <div className="max-h-screen w-6/12 ">
          <div className="text-3xl font-bold">Art Talk</div>
          <div className="relative border-2 border-black">
            <div className="absolute left-0 top-0 h-full w-full ">
              <CanvasWithCircle />
            </div>
            <img
              className=" m-auto p-8"
              style={{ height: "calc(100vh - 200px)" }}
              src="https://nrs.harvard.edu/urn-3:HUAM:INV155627_dynmc?width=3000&height=3000"
            ></img>
          </div>
          <div>
            <div className="text-xl">Construct III-C</div>
            <div>Barbara Kasten, 1980</div>
          </div>
        </div>
        <div className="w-4/12 max-w-[500px] pt-11">
          <TopFeedback feedback={FIRST_FEEDBACK} />
        </div>
      </main>
    </>
  );
};

export default Home;

import { prisma } from "~/server/db";
import { NextApiRequest, NextApiResponse } from "next";
import { comma } from "postcss/lib/list";

export type Comment = {
  x: number;
  y: number;
  width: number;
  height: number;
  xPercentage: number;
  yPercentage: number;
  body: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const reqBody: Comment = JSON.parse(req.body).comment;

  const x: number = reqBody.x;
  const y: number = reqBody.y;
  const width: number = reqBody.width;
  const height: number = reqBody.height;
  const xPercentage: number = reqBody.xPercentage;
  const yPercentage: number = reqBody.yPercentage;
  const body: string = reqBody.body;

  await prisma.comment
    .create({
      data: {
        x: x,
        y: y,
        width: width,
        height: height,
        xPercentage: xPercentage,
        yPercentage: yPercentage,
        body: body,
      },
    })
    .then((comment) => {
      console.log(comment);
      res.status(200).json({ comment: comment });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
}

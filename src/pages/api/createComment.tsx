import { prisma } from "~/server/db";
import { NextApiRequest, NextApiResponse } from "next";
import { comma } from "postcss/lib/list";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { x, y, body, width, height, xPercentage, yPercentage } = JSON.parse(
    req.body
  ).comment;

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

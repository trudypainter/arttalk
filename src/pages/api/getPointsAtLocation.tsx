import { prisma } from "~/server/db";
import { NextApiRequest, NextApiResponse } from "next";
import { comma } from "postcss/lib/list";

export type Dimensions = {
  xPercentage: number;
  yPercentage: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const reqBody: Dimensions = JSON.parse(req.body).location;

  const xPercentage: number = reqBody.xPercentage;
  const yPercentage: number = reqBody.yPercentage;

  const TOLERANCE = 0.15;

  console.log(xPercentage, yPercentage);

  await prisma.comment
    .findMany({
      where: {
        xPercentage: {
          gte: xPercentage - TOLERANCE,
          lte: xPercentage + TOLERANCE,
        },
        yPercentage: {
          gte: xPercentage - TOLERANCE,
          lte: xPercentage + TOLERANCE,
        },
      },
    })
    .then((comments) => {
      console.log("comments are:", comments);
      res.status(200).json({ comments: comments });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
}

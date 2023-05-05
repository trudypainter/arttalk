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
  // find all prisma comments and return them
  await prisma.comment
    .findMany()
    .then((comments) => {
      console.log("comments are:", comments);
      res.status(200).json({ comments: comments });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
}

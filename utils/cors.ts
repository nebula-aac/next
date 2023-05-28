import { NextApiRequest, NextApiResponse } from "next";

const allowCors = (fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('origin', 'https://lobste-rs-graph-mu.vercel.app/');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    await fn(req, res);
};

export default allowCors;

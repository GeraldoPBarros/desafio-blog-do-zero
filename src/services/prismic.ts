import Prismic from '@prismicio/client';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getPrismicClient(req?: unknown) {
  const prismic = Prismic.client(process.env.PRISMIC_API_ENDPOINT, {
    req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  return prismic;
}

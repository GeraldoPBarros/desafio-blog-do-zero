/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState, useEffect } from 'react';

import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import Prismic from '@prismicio/client';

import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

// import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  const [contentPost, setContentPost] = useState(null);

  useEffect(() => {
    const amountWordsOfBody = RichText.asText(
      post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
    ).split(' ').length;

    const amountWordsOfHeading = post.data.content.reduce((acc, data) => {
      if (data.heading) {
        return [...acc, ...data.heading.split(' ')];
      }
      return [...acc];
    }, []).length;

    const finalAmount = Math.ceil(
      (amountWordsOfBody + amountWordsOfHeading) / 200
    ).toString();

    if (router.isFallback) {
      setContentPost(<div>Carregando...</div>);
    } else {
      setContentPost(
        <>
          <Header />
          <main className={styles.container}>
            <img src={`${post.data?.banner.url}`} alt="banner" />
            <div className={styles.container_info}>
              <h1>{post.data?.title}</h1>
              <div className={styles.container_small_desc}>
                <div>
                  {format(
                    new Date(post?.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </div>
                <div>{post.data?.author}</div>
                <div>{finalAmount} min</div>
              </div>
              {post.data?.content.map(content => (
                <>
                  <h3 key={content.heading}>{content.heading}</h3>
                  {content.body.map((element, index) => (
                    <p key={index}>{element.text}</p>
                  ))}
                </>
              ))}
            </div>
          </main>
        </>
      );
    }
  }, [post]);

  return contentPost;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['publication.title'],
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: `${post?.uid}`,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', `${params.slug}`, {});

  let title;

  if (typeof response.data.title === 'string') {
    title = response.data.title;
  } else {
    title = response.data.title[0].text;
  }

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title,
      subtitle: response.data?.subtitle,
      author: response.data?.author,
      banner: {
        url: response.data?.banner.url,
      },
      content: response.data?.content,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 1,
  };
};

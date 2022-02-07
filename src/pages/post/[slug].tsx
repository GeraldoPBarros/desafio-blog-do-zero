/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';

import { RichText } from 'prismic-dom';
import Head from 'next/head';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
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
  const [readingMin, setReadingMin] = useState('');

  useEffect(() => {
    let strCount = '';
    let arrCount = [];

    for (let x = 0; x < post.data.content.length; x += 1) {
      for (let y = 0; y < post.data.content[x].body.length; y += 1) {
        strCount += post.data.content[x].body[y].text;
      }

      if (x === post.data.content.length - 1) {
        arrCount = strCount.split(' ');
        setReadingMin(Math.round(arrCount.length / 200).toString());
      }
    }
  }, [post]);

  return (
    <>
      <Head>
        <title>Posts | Blog do Zero</title>
      </Head>
      <img src="/images/Logo.png" alt="logo" />
      <main className={styles.container}>
        <img src={`${post.data.banner.url}`} alt="banner" />
        <div className={styles.container_info}>
          <h1>{post.data.title}</h1>
          <div className={styles.container_small_desc}>
            <div>{post.first_publication_date}</div>
            <div>{post.data.author}</div>
            <div>{readingMin} min</div>
          </div>
          {post.data.content.map(content => (
            <>
              <h3>{content.heading}</h3>
              {content.body.map(paragraph => (
                <p>{paragraph.text}</p>
              ))}
            </>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);
  return {
    paths: [],
    fallback: true,
  };

  // TODO
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', params.slug.toString(), {});

  const post = {
    first_publication_date: new Date(
      response.first_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    data: {
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};

// REVISAR GET STATIC PATHS

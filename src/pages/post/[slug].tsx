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
  const [readingMin, setReadingMin] = useState('');
  const [contentPost, setContentPost] = useState(null);

  useEffect(() => {
    /* let strCount = '';
    let arrCount = [];

    console.log('CONTENT: ', post.data.content);

     if (post !== undefined) {
      for (let x = 0; x < post.data?.content.length; x += 1) {
        if (x === 0) strCount += `${post.data?.content[x].heading} `;
        else strCount += ` ${post.data?.content[x].heading} `;
        for (let y = 0; y < post.data?.content[x].body.length; y += 1) {
          if (y === 0) strCount += `${post.data?.content[x].body[y].text}`;
          else strCount += ` ${post.data?.content[x].body[y].text}`;
        }

        if (x === post.data?.content.length - 1) {
          console.log('STRING: ', strCount);
          arrCount = strCount.split(' ');
          console.log('ARRAY FINAL: ', arrCount);
          console.log('LENGTH: ', arrCount.length);
          console.log('DIVISÃO: ', arrCount.length / 200);
          console.log(
            'VALOR FINAL: ',
            Math.round(arrCount.length / 200).toString()
          );
          setReadingMin(Math.round(arrCount.length / 200).toString());
        }
      }
    } */
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

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['publication.title'],
      pageSize: 2,
    }
  );

  /* function findPaths(paths: any) {
    return paths.find(p => p.params.slug !== undefined);
  } */

  const paths = posts.results.map(post => ({
    params: {
      slug: `${post?.uid}`,
    },
  }));

  // const paths = [findPaths(iniPaths)];

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', `${params.slug}`, {});

  // const title = JSON.stringify(response.data?.title, null, 2);
  // const subtitle = JSON.stringify(response.data?.subtitle, null, 2);

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data?.title,
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

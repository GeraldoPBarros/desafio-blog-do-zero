/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState } from 'react';
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import Link from 'next/link';
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Home({ postsPagination }: HomeProps) {
  const [isNextPage, setIsNextPage] = useState(false);
  const [nextPageValues, setNextPageValues] = useState([]);

  async function updateNextPage(url) {
    const res = await fetch(url);
    const tempData = await res.json();
    const next_page_posts = tempData.results.map(np_post => {
      return {
        uid: np_post.uid,
        first_publication_date: np_post.first_publication_date,
        data: {
          title: RichText.asText(np_post.data.title),
          subtitle: np_post.data.subtitle,
          author: np_post.data.author,
        },
      };
    });
    setIsNextPage(true);
    setNextPageValues(next_page_posts);
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <>
          {postsPagination.results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h2>{post.data.title}</h2>
                <p className={styles.subtitle}>{post.data.subtitle}</p>
                <div className={styles.containerDateAndAuthor}>
                  <div className={styles.subContainerDateAndAuthor}>
                    <img src="/images/calendar.png" alt="calendar" />
                    <p>
                      {format(
                        new Date(post?.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </p>
                  </div>
                  <div className={styles.subContainerDateAndAuthor}>
                    <img src="/images/user.png" alt="calendar" />
                    <p>{post.data.author}</p>
                  </div>
                </div>
                <br />
                <br />
              </a>
            </Link>
          ))}
          <br />
          {postsPagination.next_page !== null && !isNextPage && (
            <button
              type="button"
              className={styles.carregarMais}
              onClick={() => updateNextPage(postsPagination.next_page)}
            >
              <h4>Carregar mais posts</h4>
            </button>
          )}
          {postsPagination.next_page !== null && isNextPage && (
            <>
              {nextPageValues.map(post => (
                <Link key={post.uid} href={`/post/${post.uid}`}>
                  <a>
                    <h2>{post.data.title}</h2>
                    <p className={styles.subtitle}>{post.data.subtitle}</p>
                    <div className={styles.containerDateAndAuthor}>
                      <div className={styles.subContainerDateAndAuthor}>
                        <img src="/images/calendar.png" alt="calendar" />
                        <p>
                          {format(
                            new Date(post?.first_publication_date),
                            'dd MMM yyyy',
                            {
                              locale: ptBR,
                            }
                          )}
                        </p>
                      </div>
                      <div className={styles.subContainerDateAndAuthor}>
                        <img src="/images/user.png" alt="calendar" />
                        <p>{post.data.author}</p>
                      </div>
                    </div>
                    <br />
                    <br />
                  </a>
                </Link>
              ))}
            </>
          )}
        </>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  // FETCHING PAGE DATA

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['publication.title'],
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: RichText.asText(post.data.title),
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};

import Layout from '../../components/layout';
import Head from 'next/head';
import { getAllPostIds, getPostData } from '../../lib/posts';
import asyncFlow from 'asyncpipe';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

export function getStaticProps({ params }) {
  return asyncFlow(getPostData, (postData) => ({
    props: { postData },
  }))(params.id);
}

export function getStaticPaths() {
  return getAllPostIds().then((paths) => ({
    paths,
    fallback: false,
  }));
}

export default function Post({ postData: { title, id, date, contentHtml } }) {
  return (
    <Layout>
      <Head>
        <title>{title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    </Layout>
  );
}

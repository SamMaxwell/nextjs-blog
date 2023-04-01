import Layout from '../../components/layout';
import Head from 'next/head';
import { getAllPostIds, getPostData } from '../../lib/posts';
import asyncFlow from 'asyncpipe';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';
import { GetStaticProps, GetStaticPaths } from 'next';

export const getStaticProps: GetStaticProps = ({ params }) =>
  asyncFlow(getPostData, (postData) => ({
    props: { postData },
  }))(params.id);

export const getStaticPaths: GetStaticPaths = () =>
  asyncFlow(getAllPostIds, (paths) => ({
    paths,
    fallback: false,
  }))();

const Post = ({ postData: { title, id, date, contentHtml } }) => (
  <Layout home={false}>
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

export default Post;

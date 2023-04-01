import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/layout';
import Alert from '../../components/alert'

export default function FirstPost() {
  return (
    <Layout home>
      <Head>
        <title>First Post</title>
      </Head>
      <h1>First Post</h1>
      <Alert type="success">This is a success alert</Alert>
      <Alert type="error">This is an error alert</Alert>
    </Layout>
  );
}

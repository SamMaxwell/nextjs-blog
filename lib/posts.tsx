import { readdir, readFile } from 'fs/promises';
import asyncFlow from 'asyncpipe';
import { join } from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { map, sortBy } from 'lodash/fp';

const getContents = (fullPath: string) => readFile(fullPath, 'utf8');

const resolveAll = (xs: [Promise<any>]) => Promise.all(xs);

const sortByDate = sortBy(['date']);

const toParamsId = (fileName: string) => ({ params: { id: fileName.replace(/\.md$/, '') } });

const processMatterResult = (id: string) => (matterResult: matter.GrayMatterFile<any>) => ({
  id,
  ...matterResult.data,
  content: matterResult.content,
});

const processContent = (content: string) => remark().use(html).process(content);

const toData = (rest: Object) => (processedContent: any) => ({
  ...rest,
  contentHtml: processedContent.toString(),
});

const toPostData = ({ content, ...rest }) => asyncFlow(processContent, toData(rest))(content);

const toPostsData = (postsDirectory: string) => (fileName: string) => {
  const id = fileName.replace(/\.md$/, '');

  const parseMd = (fileContents) => {
    const matterResult = matter(fileContents);
    return {
      id,
      ...matterResult.data,
    };
  };

  return asyncFlow(getContents, parseMd)(join(postsDirectory, fileName));
};

const postsDirectory = join(process.cwd(), 'posts');

export const getSortedPostsData = () =>
  asyncFlow(readdir, map(toPostsData(postsDirectory)), resolveAll, sortByDate)(postsDirectory);

export const getAllPostIds = () => asyncFlow(readdir, map(toParamsId))(postsDirectory);

export const getPostData = (id: string) =>
  asyncFlow(
    getContents,
    matter,
    processMatterResult(id),
    toPostData,
  )(join(postsDirectory, `${id}.md`));

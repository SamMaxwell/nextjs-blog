import { readdir, readFile } from 'fs/promises';
import asyncFlow from 'asyncpipe';
import { join } from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { map, sortBy } from 'lodash/fp';

const postsDirectory = join(process.cwd(), 'posts');

export const getSortedPostsData = () =>
  asyncFlow(
    readdir,
    map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = join(postsDirectory, fileName);
      return asyncFlow(
        () => readFile(fullPath, 'utf8'),
        (fileContents) => {
          const matterResult = matter(fileContents);
          return {
            id,
            ...matterResult.data,
          };
        },
      )();
    }),
    (fs) => Promise.all(fs),
    sortBy(['date']),
  )(postsDirectory);

export const getAllPostIds = () =>
  asyncFlow(
    readdir,
    map((fileName) => ({
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    })),
  )(postsDirectory);

export const getPostData = (id) =>
  asyncFlow(
    (fullPath) => readFile(fullPath, 'utf8'),
    matter,
    (matterResult) => ({ id, ...matterResult.data, content: matterResult.content }),
    ({ content, ...rest }) =>
      asyncFlow(
        () => remark().use(html).process(content),
        (processedContent) => ({
          ...rest,
          contentHtml: processedContent.toString(),
        }),
      )(),
  )(join(postsDirectory, `${id}.md`));

import { readdir, readFile } from 'fs/promises';
import asyncFlow from 'asyncpipe';
import { join } from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = join(process.cwd(), 'posts');

export function getSortedPostsData() {
  return asyncFlow(
    readdir,
    (fileNames) =>
      fileNames.map((fileName) => {
        const id = fileName.replace(/\.md$/, '');
        const fullPath = join(postsDirectory, fileName);
        return readFile(fullPath, 'utf8').then((fileContents) => {
          const matterResult = matter(fileContents);
          return {
            id,
            ...matterResult.data,
          };
        });
      }),
    (fs) => Promise.all(fs),
    (allPostsData) => allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1)),
  )(postsDirectory);
}

export function getAllPostIds() {
  return asyncFlow(readdir, (fileNames) =>
    fileNames.map((fileName) => ({
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    })),
  )(postsDirectory);
}

export function getPostData(id) {
  return asyncFlow(
    (fullPath) => readFile(fullPath, 'utf8'),
    matter,
    (matterResult) => ({ id, ...matterResult.data, content: matterResult.content }),
    ({ content, ...rest }) =>
      remark()
        .use(html)
        .process(content)
        .then((processedContent) => ({
          ...rest,
          contentHtml: processedContent.toString(),
        })),
  )(join(postsDirectory, `${id}.md`));
}

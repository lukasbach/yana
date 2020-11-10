import program from 'commander';
import { LogService } from '../src/common/LogService';
import { LocalSqliteDataSource } from '../src/datasource/LocalSqliteDataSource';
import { v4 as uuid } from 'uuid';
import { undup } from '../src/utils';
import { InternalTag } from '../src/datasource/InternalTag';
import { DataItemKind } from '../src/types';

program
  .option('-d, --dest <dest>', 'target folder')
  .option('-s, --sizes <sizes>', 'folder sizes, as integers, seperated by commas')
  .option('-t, --transactionsize <transactionsize>', 'sqlite transaction size when inserting rows');

program.parse(process.argv);

console.log(process.argv)
console.log(program.dest, program.sizes, program.transactionsize)
console.log(program.opts())

const targetFolder = program.dest;
const folderSizes = (program.sizes as string).split(',').map(i => parseInt(i));
const transactionSize = parseInt(program.transactionsize);
const totalNumberOfNotes = folderSizes.reduce((a, b) => a + b, 0);

const loremIpsum = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.';

const tags = undup(loremIpsum
  .replace(/\.|\,/g, '')
  .toLowerCase()
  .split(' '));

const noteContent = JSON.stringify({
  "adf": {
    "version": 1,
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": '_'.repeat(25).split('').map(() => ({
          "type": "text",
          "text": loremIpsum
        }))
      }
    ]
  }
});

LogService.enabled = false;

function randomIntFromInterval(min: number, max: number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomSubarray(arr: any[], size: number) {
  var shuffled = arr.slice(0), i = arr.length, temp, index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

const getTimes = () => {
  const now = Date.now();
  let maxDiff = 4000000;
  const lastChange = randomIntFromInterval(now - maxDiff, now);
  const created = randomIntFromInterval(lastChange - maxDiff, lastChange);
  return { lastChange, created }
}

const performTransactions = async (items: any[], handler: (items: any[]) => Promise<void>) => {
  for (let i = 0; i < items.length; i += transactionSize) {
    const numberOfItems = transactionSize + i >= items.length ? items.length - i : transactionSize;
    await handler(items.slice(i, i + numberOfItems));
  }
}

(async () => {
  await  LocalSqliteDataSource.init({
    sourcePath: targetFolder
  });

  const db = LocalSqliteDataSource.getDb(targetFolder);
  const rootItemIds: string[] = [];
  let itemsProcessed = 0;
  let lastPercentageAnnounced = 0;

  for (const size of folderSizes) {
    const itemIds: string[] = [];
    await performTransactions(
      '_'
        .repeat(size)
        .split('')
        .map((_, idx) => `Item ${(idx + '').padStart((size + '').length, '0')}/${size}`),
      async names => {
        itemsProcessed += names.length;
        const percentage = Math.floor((itemsProcessed / totalNumberOfNotes) * 1000);
        if (percentage > lastPercentageAnnounced) {
          console.log(`${percentage / 10}% done (${itemsProcessed}/${totalNumberOfNotes} notes)`);
          lastPercentageAnnounced = percentage;
        }

        const currentItemIds: string[] = [];

        await db('items').insert(names.map(name => {
          const id = uuid();
          itemIds.push(id);
          currentItemIds.push(id);
          return {
            id,
            name,
            kind: DataItemKind.NoteItem,
            ...getTimes(),
            noteType: 'atlaskit-editor-note'
          };
        }));

        await db('note_contents').insert(currentItemIds.map(id => {
          return {
            noteId: id,
            content: noteContent
          };
        }));

        await db('items_tags').insert(
          currentItemIds
            .map(id => {
              const appliedTags = getRandomSubarray(tags, randomIntFromInterval(0, 18));
              return appliedTags.map(tag => ({
                tagName: tag, noteId: id
              }));
            })
            .reduce((a, b) => [...a, ...b], [])
        );
      }
    );

    const rootId = uuid();
    rootItemIds.push(rootId);

    await db('items').insert({
      id: rootId,
      name: `Folder with ${size} items`,
      kind: DataItemKind.Collection,
      ...getTimes()
    });

    await performTransactions(itemIds, async setOfItemIds => {
      await db('items_childs').insert(setOfItemIds.map(itemId => ({
        parentId: rootId, childId: itemId
      })));
    });
  }

  await db('items').insert([
    {
      id: 'workspace-root',
      name: 'workspace-root',
      kind: DataItemKind.Collection,
      ...getTimes(),
    },
    {
      id: 'my-collections',
      name: 'My Collections',
      kind: DataItemKind.Collection,
      ...getTimes(),
    },
  ]);

  await db('items_tags').insert([
    {
      noteId: 'workspace-root',
      tagName: InternalTag.WorkspaceRoot
    },
  ]);

  await performTransactions(rootItemIds, async setOfRootItemIds => {
    await db('items_childs').insert(setOfRootItemIds.map(rootId => ({
      parentId: 'my-collections', childId: rootId
    })));
  });

  await db('items_childs').insert({
    parentId: 'workspace-root', childId: 'my-collections'
  });

  await db.destroy();
})();
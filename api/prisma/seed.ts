import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear old data first so the seed can be run more than once.
  // Books must be deleted before genres, because each book points to a genre.
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();

  // Create the genres and keep the results so we can use their ids.
  const fiction = await prisma.genre.create({ data: { name: 'Fiction' } });
  const science = await prisma.genre.create({ data: { name: 'Science' } });
  const history = await prisma.genre.create({ data: { name: 'History' } });
  const technology = await prisma.genre.create({
    data: { name: 'Technology' },
  });

  // Create the books, each linked to a genre through genreId.
  await prisma.book.createMany({
    data: [
      // Fiction (4)
      { title: 'Things Fall Apart', author: 'Chinua Achebe', genreId: fiction.id },
      { title: 'Petals of Blood', author: 'Ngugi wa Thiong\'o', genreId: fiction.id },
      { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', genreId: fiction.id },
      { title: 'The River Between', author: 'Ngugi wa Thiong\'o', genreId: fiction.id },

      // Science (4)
      { title: 'A Brief History of Time', author: 'Stephen Hawking', genreId: science.id },
      { title: 'The Selfish Gene', author: 'Richard Dawkins', genreId: science.id },
      { title: 'Cosmos', author: 'Carl Sagan', genreId: science.id },
      { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot', genreId: science.id },

      // History (4)
      { title: 'Sapiens', author: 'Yuval Noah Harari', genreId: history.id },
      { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', genreId: history.id },
      { title: 'Long Walk to Freedom', author: 'Nelson Mandela', genreId: history.id },
      { title: 'Africa: A Biography of the Continent', author: 'John Reader', genreId: history.id },

      // Technology (4)
      { title: 'Clean Code', author: 'Robert C. Martin', genreId: technology.id },
      { title: 'The Pragmatic Programmer', author: 'Andrew Hunt and David Thomas', genreId: technology.id },
      { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', genreId: technology.id },
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen et al.', genreId: technology.id },
    ],
  });

  const genreCount = await prisma.genre.count();
  const bookCount = await prisma.book.count();
  console.log(`Seeded ${genreCount} genres and ${bookCount} books.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

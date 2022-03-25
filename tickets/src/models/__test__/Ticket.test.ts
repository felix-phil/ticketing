import { Ticket } from '../Ticket';

it('implements optimistic concurrency control', async () => {
  //  Create a Ticket instance
  const ticket = await Ticket.build({
    title: 'Joe boy platform concert',
    price: 500,
    userId: '123',
  });
  //  Save ticket to DB
  await ticket.save();

  //  fetch ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make 2 separate changes to tickets fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save first fetched ticket

  await firstInstance!.save();

  // save second fetched ticket
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }
  throw new Error('Should not react here');
});

it('increments the version on multiple saves', async () => {
  //  Create a Ticket instance
  const ticket = await Ticket.build({
    title: 'Joe boy platform concert',
    price: 500,
    userId: '123',
  });
  //  Save ticket to DB
  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});

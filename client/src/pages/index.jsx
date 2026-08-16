import Head from 'next/head';
import Dashboard from '../components/Dashboard';

export default function Home() {
  return (
    <>
      <Head>
        <title>Couples' Financial Uplifting & Budget Planner</title>
        <meta name="description" content="Combine salaries, track expenses with the 50/30/20 rule, calculate proportional bill splits, and plan savings goals together." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Dashboard />
      </main>
    </>
  );
}

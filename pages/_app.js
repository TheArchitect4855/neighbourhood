import Head from 'next/head';
import '../styles/globals.css'

function Neighbourhood({ Component, pageProps }) {
  return (
    <>
      <Head>
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default Neighbourhood;

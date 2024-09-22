import '../styles/globals.css'  // or '../styles/output.css' if you're using a separate output file

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
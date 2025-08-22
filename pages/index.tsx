export const getServerSideProps = () => ({
  redirect: { destination: '/posts', permanent: false },
})

export default function Home() { return null }

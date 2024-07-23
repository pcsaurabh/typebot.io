import { GetServerSidePropsContext } from 'next'
// import { getServerSession } from 'next-auth'
// import { getAuthOptions } from './api/auth/[...nextauth]'

// export default function Page() {
//   return null
// }

// export const getServerSideProps = async (
//   context: GetServerSidePropsContext
// ) => {
//   const session = await getServerSession(
//     context.req,
//     context.res,
//     getAuthOptions({})
//   )
//   if (!session?.user) {
//     return {
//       redirect: {
//         permanent: false,
//         destination:
//           context.locale !== context.defaultLocale
//             ? `/${context.locale}/signin`
//             : '/signin',
//       },
//     }
//   }
//   return {
//     redirect: {
//       permanent: false,
//       destination:
//         context.locale !== context.defaultLocale
//           ? `/${context.locale}/typebots`
//           : '/typebots',
//     },
//   }
// }

import { EditorPage } from '@/features/editor/components/EditorPage'

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const callbackUrl = context.query.callbackUrl?.toString()
  const redirectPath =
    context.query.redirectPath?.toString() ??
    (callbackUrl
      ? new URL(callbackUrl).searchParams.get('redirectPath')
      : undefined)
  return redirectPath
    ? {
        redirect: {
          permanent: false,
          destination: redirectPath,
        },
      }
    : { props: {} }
}

export default function Page() {
  return <EditorPage />
}

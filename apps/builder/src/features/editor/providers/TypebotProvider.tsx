import {
  PublicTypebot,
  PublicTypebotV6,
  TypebotV6,
  typebotV6Schema,
} from '@typebot.io/schemas'
import { Router } from 'next/router'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isDefined, omit } from '@typebot.io/lib'
import { edgesAction, EdgesActions } from './typebotActions/edges'
import { itemsAction, ItemsActions } from './typebotActions/items'
import { GroupsActions, groupsActions } from './typebotActions/groups'
import { blocksAction, BlocksActions } from './typebotActions/blocks'
import { variablesAction, VariablesActions } from './typebotActions/variables'
import { dequal } from 'dequal'
import { useToast } from '@/hooks/useToast'
import { useUndo } from '../hooks/useUndo'
import { useAutoSave } from '@/hooks/useAutoSave'
import { preventUserFromRefreshing } from '@/helpers/preventUserFromRefreshing'
import { areTypebotsEqual } from '@/features/publish/helpers/areTypebotsEqual'
import { isPublished as isPublishedHelper } from '@/features/publish/helpers/isPublished'
import { convertPublicTypebotToTypebot } from '@/features/publish/helpers/convertPublicTypebotToTypebot'
import { trpc } from '@/lib/trpc'
import { EventsActions, eventsActions } from './typebotActions/events'
import { useGroupsStore } from '@/features/graph/hooks/useGroupsStore'

const autoSaveTimeout = 15000

type UpdateTypebotPayload = Partial<
  Pick<
    TypebotV6,
    | 'theme'
    | 'selectedThemeTemplateId'
    | 'settings'
    | 'publicId'
    | 'name'
    | 'icon'
    | 'customDomain'
    | 'resultsTablePreferences'
    | 'isClosed'
    | 'whatsAppCredentialsId'
    | 'riskLevel'
  >
>

export type SetTypebot = (
  newPresent: TypebotV6 | ((current: TypebotV6) => TypebotV6)
) => void

const typebotContext = createContext<
  {
    typebot?: TypebotV6
    publishedTypebot?: PublicTypebotV6
    publishedTypebotVersion?: PublicTypebot['version']
    currentUserMode: 'guest' | 'read' | 'write'
    is404: boolean
    isPublished: boolean
    isSavingLoading: boolean
    save: () => Promise<void>
    undo: () => void
    redo: () => void
    canRedo: boolean
    canUndo: boolean
    updateTypebot: (props: {
      updates: UpdateTypebotPayload
      save?: boolean
    }) => Promise<TypebotV6 | undefined>
    restorePublishedTypebot: () => void
  } & GroupsActions &
    BlocksActions &
    ItemsActions &
    VariablesActions &
    EdgesActions &
    EventsActions
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
>({})

export const TypebotProvider = ({
  children,
  typebotId,
}: {
  children: ReactNode
  typebotId?: string
}) => {
  const { showToast } = useToast()
  const [is404, setIs404] = useState(false)
  const setGroupsCoordinates = useGroupsStore(
    (state) => state.setGroupsCoordinates
  )

  const [typebotData, setTypebotData] = useState({
    typebot: {
      version: '6',
      id: 'clywmiow00001mu6pyyo2if97',
      name: 'Lead Generation‌‌‌‍‍‌‌‍‌',
      events: [
        {
          id: 'k6kY6gwRE6noPoYQNGzgUq',
          outgoingEdgeId: 'oNvqaqNExdSH2kKEhKZHuE',
          graphCoordinates: {
            x: 0,
            y: 0,
          },
          type: 'start',
        },
      ],
      groups: [
        {
          id: 'kinRXxYop2X4d7F9qt8WNB',
          title: 'Welcome',
          graphCoordinates: {
            x: 1,
            y: 148,
          },
          blocks: [
            {
              id: 'sc1y8VwDabNJgiVTBi4qtif',
              type: 'text',
              content: {
                richText: [
                  {
                    type: 'p',
                    children: [
                      {
                        text: 'Welcome to ',
                      },
                      {
                        bold: true,
                        text: 'AA',
                      },
                      {
                        text: ' (Awesome Agency)',
                      },
                    ],
                  },
                ],
              },
            },
            {
              id: 's7YqZTBeyCa4Hp3wN2j922c',
              type: 'image',
              content: {
                url: 'https://media2.giphy.com/media/XD9o33QG9BoMis7iM4/giphy.gif?cid=fe3852a3ihg8rvipzzky5lybmdyq38fhke2tkrnshwk52c7d&rid=giphy.gif&ct=g',
              },
            },
            {
              id: 'sbjZWLJGVkHAkDqS4JQeGow',
              outgoingEdgeId: 'i51YhHpk1dtSyduFNf5Wim',
              type: 'choice input',
              items: [
                {
                  id: 'hQw2zbp7FDX7XYK9cFpbgC',
                  content: 'Hi!',
                },
              ],
            },
          ],
        },
        {
          id: 'o4SH1UtKANnW5N5D67oZUz',
          title: 'Email',
          graphCoordinates: {
            x: 669,
            y: 141,
          },
          blocks: [
            {
              id: 'sxeYubYN6XzhAfG7m9Fivhc',
              type: 'text',
              content: {
                richText: [
                  {
                    type: 'p',
                    children: [
                      {
                        text: 'Great! Nice to meet you {{Name}}',
                      },
                    ],
                  },
                ],
              },
            },
            {
              id: 'scQ5kduafAtfP9T8SHUJnGi',
              type: 'text',
              content: {
                richText: [
                  {
                    type: 'p',
                    children: [
                      {
                        text: "What's the best email we can reach you at?",
                      },
                    ],
                  },
                ],
              },
            },
            {
              id: 'snbsad18Bgry8yZ8DZCfdFD',
              outgoingEdgeId: 'w3MiN1Ct38jT5NykVsgmb5',
              type: 'email input',
              options: {
                variableId: 'v3VFChNVSCXQ2rXv4DrJ8Ah',
              },
            },
          ],
        },
        {
          id: 'q5dAhqSTCaNdiGSJm9B9Rw',
          title: 'Name',
          graphCoordinates: {
            x: 340,
            y: 143,
          },
          blocks: [
            {
              id: 'sgtE2Sy7cKykac9B223Kq9R',
              type: 'text',
              content: {
                richText: [
                  {
                    type: 'p',
                    children: [
                      {
                        text: "What's your name?",
                      },
                    ],
                  },
                ],
              },
            },
            {
              id: 'sqEsMo747LTDnY9FjQcEwUv',
              outgoingEdgeId: '4tYbERpi5Po4goVgt6rWXg',
              type: 'text input',
              options: {
                variableId: 'giiLFGw5xXBCHzvp1qAbdX',
              },
            },
          ],
        },
        {
          id: 'fKqRz7iswk7ULaj5PJocZL',
          title: 'Services',
          graphCoordinates: {
            x: 1002,
            y: 144,
          },
          blocks: [
            {
              id: 'su7HceVXWyTCzi2vv3m4QbK',
              type: 'text',
              content: {
                richText: [
                  {
                    type: 'p',
                    children: [
                      {
                        text: 'What services are you interested in?',
                      },
                    ],
                  },
                ],
              },
            },
            {
              id: 's5VQGsVF4hQgziQsXVdwPDW',
              outgoingEdgeId: 'ohTRakmcYJ7GdFWRZrWRjk',
              type: 'choice input',
              items: [
                {
                  id: 'fnLCBF4NdraSwcubnBhk8H',
                  content: 'Website dev',
                },
                {
                  id: 'a782h8ynMouY84QjH7XSnR',
                  content: 'Content Marketing',
                },
                {
                  id: 'jGvh94zBByvVFpSS3w97zY',
                  content: 'Social Media',
                },
                {
                  id: '6PRLbKUezuFmwWtLVbvAQ7',
                  content: 'UI / UX Design',
                },
              ],
            },
          ],
        },
        {
          id: '7qHBEyCMvKEJryBHzPmHjV',
          title: 'Additional information',
          graphCoordinates: {
            x: 1337,
            y: 145,
          },
          blocks: [
            {
              id: 'sqR8Sz9gW21aUYKtUikq7qZ',
              type: 'text',
              content: {
                richText: [
                  {
                    type: 'p',
                    children: [
                      {
                        text: 'Can you tell me a bit more about your needs?',
                      },
                    ],
                  },
                ],
              },
            },
            {
              id: 'sqFy2G3C1mh9p6s3QBdSS5x',
              outgoingEdgeId: 'sH5nUssG2XQbm6ZidGv9BY',
              type: 'text input',
              options: {
                isLong: true,
              },
            },
          ],
        },
        {
          id: 'vF7AD7zSAj7SNvN3gr9N94',
          title: 'Bye',
          graphCoordinates: {
            x: 1668,
            y: 143,
          },
          blocks: [
            {
              id: 'seLegenCgUwMopRFeAefqZ7',
              type: 'text',
              content: {
                richText: [
                  {
                    type: 'p',
                    children: [
                      {
                        text: 'Perfect!',
                      },
                    ],
                  },
                ],
              },
            },
            {
              id: 's779Q1y51aVaDUJVrFb16vv',
              type: 'text',
              content: {
                richText: [
                  {
                    type: 'p',
                    children: [
                      {
                        text: "We'll get back to you at {{Email}}",
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
      edges: [
        {
          id: 'oNvqaqNExdSH2kKEhKZHuE',
          from: {
            eventId: 'k6kY6gwRE6noPoYQNGzgUq',
          },
          to: {
            groupId: 'kinRXxYop2X4d7F9qt8WNB',
          },
        },
        {
          id: 'i51YhHpk1dtSyduFNf5Wim',
          from: {
            blockId: 'sbjZWLJGVkHAkDqS4JQeGow',
          },
          to: {
            groupId: 'q5dAhqSTCaNdiGSJm9B9Rw',
          },
        },
        {
          id: '4tYbERpi5Po4goVgt6rWXg',
          from: {
            blockId: 'sqEsMo747LTDnY9FjQcEwUv',
          },
          to: {
            groupId: 'o4SH1UtKANnW5N5D67oZUz',
          },
        },
        {
          id: 'w3MiN1Ct38jT5NykVsgmb5',
          from: {
            blockId: 'snbsad18Bgry8yZ8DZCfdFD',
          },
          to: {
            groupId: 'fKqRz7iswk7ULaj5PJocZL',
          },
        },
        {
          id: 'ohTRakmcYJ7GdFWRZrWRjk',
          from: {
            blockId: 's5VQGsVF4hQgziQsXVdwPDW',
          },
          to: {
            groupId: '7qHBEyCMvKEJryBHzPmHjV',
          },
        },
        {
          id: 'sH5nUssG2XQbm6ZidGv9BY',
          from: {
            blockId: 'sqFy2G3C1mh9p6s3QBdSS5x',
          },
          to: {
            groupId: 'vF7AD7zSAj7SNvN3gr9N94',
          },
        },
      ],
      variables: [
        {
          id: 'giiLFGw5xXBCHzvp1qAbdX',
          name: 'Name',
          isSessionVariable: true,
        },
        {
          id: 'v3VFChNVSCXQ2rXv4DrJ8Ah',
          name: 'Email',
          isSessionVariable: true,
        },
      ],
      theme: {},
      selectedThemeTemplateId: null,
      settings: {
        general: {
          isBrandingEnabled: true,
        },
      },
      createdAt: '2024-07-22T06:46:26.688Z',
      updatedAt: '2024-07-22T06:46:26.688Z',
      icon: '🤝',
      folderId: null,
      publicId: null,
      customDomain: null,
      // workspaceId: 'clywkugjq0001oz5q4zh14wlp',
      resultsTablePreferences: null,
      isArchived: false,
      isClosed: false,
      whatsAppCredentialsId: null,
      riskLevel: null,
    },
    currentUserMode: 'write',
  })
  // console.log({ typebotData })

  const isFetchingTypebot = false

  // const {
  //   data: typebotData,
  //   isLoading: isFetchingTypebot,
  //   refetch: refetchTypebot,
  // } = trpc.typebot.getTypebot.useQuery(
  //   { typebotId: typebotId as string, migrateToLatestVersion: true },
  //   {
  //     enabled: isDefined(typebotId),
  //     retry: 0,
  //     onError: (error) => {
  //       if (error.data?.httpStatus === 404) {
  //         setIs404(true)
  //         return
  //       }
  //       setIs404(false)
  //       showToast({
  //         title: 'Could not fetch typebot',
  //         description: error.message,
  //         details: {
  //           content: JSON.stringify(error.data?.zodError?.fieldErrors, null, 2),
  //           lang: 'json',
  //         },
  //       })
  //     },
  //     onSuccess: () => {
  //       setIs404(false)
  //     },
  //   }
  // )

  // console.log({ typebotData, isFetchingTypebot })

  // const { data: publishedTypebotData } =
  //   trpc.typebot.getPublishedTypebot.useQuery(
  //     { typebotId: typebotId as string, migrateToLatestVersion: true },
  //     {
  //       enabled:
  //         isDefined(typebotId) &&
  //         (typebotData?.currentUserMode === 'read' ||
  //           typebotData?.currentUserMode === 'write'),
  //       onError: (error) => {
  //         showToast({
  //           title: 'Could not fetch published typebot',
  //           description: error.message,
  //           details: {
  //             content: JSON.stringify(
  //               error.data?.zodError?.fieldErrors,
  //               null,
  //               2
  //             ),
  //             lang: 'json',
  //           },
  //         })
  //       },
  //     }
  //   )

  const publishedTypebotData = null

  // console.log({ publishedTypebotData })

  const updateTypebot = ({ typebotId, typebot }) => {
    // console.log({ typebotId, typebot })
    setTypebotData((st) => ({ ...st, typebot }))
  }

  const isSaving = false

  // const { mutateAsync: updateTypebot, isLoading: isSaving } =
  //   trpc.typebot.updateTypebot.useMutation({
  //     onError: (error) =>
  //       showToast({
  //         title: 'Error while updating typebot',
  //         description: error.message,
  //       }),
  //     onSuccess: () => {
  //       console.log('called here =======>>>>>>>>>')
  //       if (!typebotId) return
  //       refetchTypebot()
  //     },
  //   })

  const typebot = typebotData?.typebot as TypebotV6
  const publishedTypebot = (publishedTypebotData?.publishedTypebot ??
    undefined) as PublicTypebotV6 | undefined
  const isReadOnly =
    typebotData &&
    ['read', 'guest'].includes(typebotData?.currentUserMode ?? 'guest')

  const [
    localTypebot,
    {
      redo,
      undo,
      flush,
      canRedo,
      canUndo,
      set: setLocalTypebot,
      setUpdateDate,
    },
  ] = useUndo<TypebotV6>(undefined, {
    isReadOnly,
    onUndo: (t) => {
      setGroupsCoordinates(t.groups)
    },
    onRedo: (t) => {
      setGroupsCoordinates(t.groups)
    },
  })

  useEffect(() => {
    if (!typebot && isDefined(localTypebot)) {
      setLocalTypebot(undefined)
      setGroupsCoordinates(undefined)
    }
    if (isFetchingTypebot || !typebot) return
    if (
      typebot.id !== localTypebot?.id ||
      new Date(typebot.updatedAt).getTime() >
        new Date(localTypebot.updatedAt).getTime()
    ) {
      setLocalTypebot({ ...typebot })
      setGroupsCoordinates(typebot.groups)
      flush()
    }
  }, [
    flush,
    isFetchingTypebot,
    localTypebot,
    setGroupsCoordinates,
    setLocalTypebot,
    showToast,
    typebot,
  ])

  const saveTypebot = useCallback(
    async (updates?: Partial<TypebotV6>) => {
      if (!localTypebot || !typebot || isReadOnly) return
      // console.log({ localTypebot })
      const typebotToSave = {
        ...localTypebot,
        ...updates,
      }
      if (
        dequal(
          JSON.parse(JSON.stringify(omit(typebot, 'updatedAt'))),
          JSON.parse(JSON.stringify(omit(typebotToSave, 'updatedAt')))
        )
      )
        return
      const newParsedTypebot = typebotV6Schema.parse({ ...typebotToSave })
      setLocalTypebot(newParsedTypebot)
      try {
        const {
          typebot: { updatedAt },
        } = await updateTypebot({
          typebotId: newParsedTypebot.id,
          typebot: newParsedTypebot,
        })
        setUpdateDate(updatedAt)
      } catch {
        setLocalTypebot({
          ...localTypebot,
        })
      }
    },
    [
      isReadOnly,
      localTypebot,
      setLocalTypebot,
      setUpdateDate,
      typebot,
      updateTypebot,
    ]
  )

  useAutoSave(
    {
      handler: saveTypebot,
      item: localTypebot,
      debounceTimeout: autoSaveTimeout,
    },
    [saveTypebot, localTypebot]
  )

  useEffect(() => {
    const handleSaveTypebot = () => {
      saveTypebot()
    }
    Router.events.on('routeChangeStart', handleSaveTypebot)
    return () => {
      Router.events.off('routeChangeStart', handleSaveTypebot)
    }
  }, [saveTypebot])

  const isPublished = useMemo(
    () =>
      isDefined(localTypebot) &&
      isDefined(localTypebot.publicId) &&
      isDefined(publishedTypebot) &&
      isPublishedHelper(localTypebot, publishedTypebot),
    [localTypebot, publishedTypebot]
  )

  useEffect(() => {
    if (!localTypebot || !typebot || isReadOnly) return
    if (!areTypebotsEqual(localTypebot, typebot)) {
      window.addEventListener('beforeunload', preventUserFromRefreshing)
    }

    return () => {
      window.removeEventListener('beforeunload', preventUserFromRefreshing)
    }
  }, [localTypebot, typebot, isReadOnly])

  const updateLocalTypebot = async ({
    updates,
    save,
  }: {
    updates: UpdateTypebotPayload
    save?: boolean
  }) => {
    if (!localTypebot || isReadOnly) return
    const newTypebot = { ...localTypebot, ...updates }
    setLocalTypebot(newTypebot)
    if (save) await saveTypebot(newTypebot)
    return newTypebot
  }

  const restorePublishedTypebot = () => {
    if (!publishedTypebot || !localTypebot) return
    setLocalTypebot(
      convertPublicTypebotToTypebot(publishedTypebot, localTypebot)
    )
  }

  return (
    <typebotContext.Provider
      value={{
        typebot: localTypebot,
        publishedTypebot,
        publishedTypebotVersion: publishedTypebotData?.version,
        currentUserMode: typebotData?.currentUserMode ?? 'guest',
        isSavingLoading: isSaving,
        is404,
        save: saveTypebot,
        undo,
        redo,
        canUndo,
        canRedo,
        isPublished,
        updateTypebot: updateLocalTypebot,
        restorePublishedTypebot,
        ...groupsActions(setLocalTypebot as SetTypebot),
        ...blocksAction(setLocalTypebot as SetTypebot),
        ...variablesAction(setLocalTypebot as SetTypebot),
        ...edgesAction(setLocalTypebot as SetTypebot),
        ...itemsAction(setLocalTypebot as SetTypebot),
        ...eventsActions(setLocalTypebot as SetTypebot),
      }}
    >
      {children}
    </typebotContext.Provider>
  )
}

export const useTypebot = () => useContext(typebotContext)

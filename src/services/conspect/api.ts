import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseNode } from '../../utills/parser/types.ts'
import type { ConspectDto, ConspectPage } from './types.ts'

const conspectBaseUrl =
  (import.meta.env.VITE_CONSPECT_API_URL as string | undefined)?.replace(
    /\/$/,
    ''
  ) ?? 'http://localhost:8090'

type Language = 'KAZ' | 'RU' | 'ENG'

export const conspectApi = createApi({
  reducerPath: 'conspectApi',
  baseQuery: fetchBaseQuery({ baseUrl: conspectBaseUrl }),
  tagTypes: ['Conspect'],
  endpoints: (builder) => ({
    listConspects: builder.query<
      ConspectPage,
      { page?: number; size?: number }
    >({
      query: ({ page = 0, size = 50 }) =>
        `/api/v1/conspects?page=${page}&size=${size}`,
      providesTags: (result) =>
        result?.content
          ? [
              ...result.content.map((c) => ({
                type: 'Conspect' as const,
                id: c.id,
              })),
              { type: 'Conspect', id: 'LIST' },
            ]
          : [{ type: 'Conspect', id: 'LIST' }],
    }),
    getConspect: builder.query<ConspectDto, string>({
      query: (id) => `/api/v1/conspects/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Conspect', id }],
    }),
    createConspect: builder.mutation<ConspectDto, { title?: string }>({
      query: (body) => ({
        url: `/api/v1/conspects`,
        method: 'POST',
        body: { title: body.title ?? 'Untitled conspect' },
      }),
      invalidatesTags: [{ type: 'Conspect', id: 'LIST' }],
    }),
    updateConspect: builder.mutation<
      ConspectDto,
      {
        id: string
        title?: string
        content?: BaseNode
        language?: Language
      }
    >({
      query: ({ id, title, content, language }) => {
        const body: Record<string, unknown> = {}
        if (title !== undefined) body.title = title
        if (content !== undefined) {
          if (language === 'RU') body.contentRu = content
          else if (language === 'KAZ') body.contentKaz = content
          else if (language === 'ENG') body.contentEng = content
          else {
            body.contentRu = content
            body.contentKaz = content
            body.contentEng = content
          }
        }
        return {
          url: `/api/v1/conspects/${id}`,
          method: 'PATCH',
          body,
        }
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Conspect', id },
        { type: 'Conspect', id: 'LIST' },
      ],
    }),
    deleteConspect: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/conspects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Conspect', id },
        { type: 'Conspect', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useListConspectsQuery,
  useGetConspectQuery,
  useLazyGetConspectQuery,
  useCreateConspectMutation,
  useUpdateConspectMutation,
  useDeleteConspectMutation,
} = conspectApi

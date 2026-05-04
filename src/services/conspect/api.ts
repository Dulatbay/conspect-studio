import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseNode } from '../../utills/parser/types.ts'
import { moduleApi } from '../module/api.ts'
import type {
  ConspectDto,
  ConspectLanguage,
  ConspectPage,
} from './types.ts'
import {
  normalizeConspectDto,
  normalizeConspectPage,
} from './normalizeConspectFromApi.ts'

const conspectBaseUrl =
  (import.meta.env.VITE_CONSPECT_API_URL as string | undefined)?.replace(
    /\/$/,
    ''
  ) ?? 'http://localhost:8090'

const languageToAi = (lang?: ConspectLanguage): 'ru' | 'kz' | 'en' => {
  if (lang === 'KAZ') return 'kz'
  if (lang === 'ENG') return 'en'
  return 'ru'
}

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
      transformResponse: (raw: unknown) => normalizeConspectPage(raw),
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
      transformResponse: (raw: unknown) => normalizeConspectDto(raw),
      providesTags: (_r, _e, id) => [{ type: 'Conspect', id }],
    }),
    createConspectInModule: builder.mutation<
      ConspectDto,
      { moduleId: string; title?: string }
    >({
      query: ({ moduleId, title }) => ({
        url: `/api/v1/modules/${moduleId}/conspects`,
        method: 'POST',
        body: { title: title ?? 'Untitled conspect' },
      }),
      transformResponse: (raw: unknown) => normalizeConspectDto(raw),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch {
          /* still refresh module roadmap */
        }
        dispatch(
          moduleApi.util.invalidateTags([
            { type: 'Module', id: arg.moduleId },
            { type: 'Module', id: 'LIST' },
          ])
        )
      },
      invalidatesTags: (result) =>
        result
          ? [
              { type: 'Conspect', id: result.id },
              { type: 'Conspect', id: 'LIST' },
            ]
          : [{ type: 'Conspect', id: 'LIST' }],
    }),
    createConspectFromUpload: builder.mutation<
      ConspectDto,
      { moduleId: string; file: File; language?: ConspectLanguage }
    >({
      query: ({ moduleId, file, language }) => {
        const form = new FormData()
        form.append('file', file)
        if (language) form.append('language', languageToAi(language))
        return {
          url: `/api/v1/modules/${moduleId}/conspects/from-upload`,
          method: 'POST',
          body: form,
        }
      },
      transformResponse: (raw: unknown) => normalizeConspectDto(raw),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch {
          /* refresh module to show ai_error / is_generating */
        }
        dispatch(
          moduleApi.util.invalidateTags([
            { type: 'Module', id: arg.moduleId },
            { type: 'Module', id: 'LIST' },
          ])
        )
      },
      invalidatesTags: (result) =>
        result
          ? [
              { type: 'Conspect', id: result.id },
              { type: 'Conspect', id: 'LIST' },
            ]
          : [{ type: 'Conspect', id: 'LIST' }],
    }),
    regenerateConspect: builder.mutation<
      ConspectDto,
      { id: string; file: File; language?: ConspectLanguage }
    >({
      query: ({ id, file, language }) => {
        const form = new FormData()
        form.append('file', file)
        if (language) form.append('language', languageToAi(language))
        return {
          url: `/api/v1/conspects/${id}/regenerate`,
          method: 'POST',
          body: form,
        }
      },
      transformResponse: (raw: unknown) => normalizeConspectDto(raw),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data?.moduleId) {
            dispatch(
              moduleApi.util.invalidateTags([
                { type: 'Module', id: data.moduleId },
                { type: 'Module', id: 'LIST' },
              ])
            )
          } else {
            dispatch(moduleApi.util.invalidateTags([{ type: 'Module' }]))
          }
        } catch {
          dispatch(moduleApi.util.invalidateTags([{ type: 'Module' }]))
        }
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Conspect', id },
        { type: 'Conspect', id: 'LIST' },
      ],
    }),
    updateConspect: builder.mutation<
      ConspectDto,
      {
        id: string
        title?: string
        content?: BaseNode
        language?: ConspectLanguage
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
      transformResponse: (raw: unknown) => normalizeConspectDto(raw),
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
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch {
          /* still refresh modules */
        }
        dispatch(moduleApi.util.invalidateTags([{ type: 'Module' }]))
      },
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
  useCreateConspectInModuleMutation,
  useCreateConspectFromUploadMutation,
  useRegenerateConspectMutation,
  useUpdateConspectMutation,
  useDeleteConspectMutation,
} = conspectApi

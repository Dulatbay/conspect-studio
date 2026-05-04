import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { ModuleDto } from './types.ts'
import { normalizeModuleDto } from './normalizeModuleFromApi.ts'

const moduleBaseUrl =
  (import.meta.env.VITE_CONSPECT_API_URL as string | undefined)?.replace(
    /\/$/,
    ''
  ) ?? 'http://localhost:8090'

export const moduleApi = createApi({
  reducerPath: 'moduleApi',
  baseQuery: fetchBaseQuery({ baseUrl: moduleBaseUrl }),
  tagTypes: ['Module'],
  endpoints: (builder) => ({
    listModules: builder.query<ModuleDto[], void>({
      query: () => `/api/v1/modules`,
      transformResponse: (raw: unknown) =>
        Array.isArray(raw) ? raw.map((m) => normalizeModuleDto(m)) : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((m) => ({ type: 'Module' as const, id: m.id })),
              { type: 'Module', id: 'LIST' },
            ]
          : [{ type: 'Module', id: 'LIST' }],
    }),
    getModule: builder.query<ModuleDto, string>({
      query: (id) => `/api/v1/modules/${id}`,
      transformResponse: (raw: unknown) => normalizeModuleDto(raw),
      providesTags: (_r, _e, id) => [{ type: 'Module', id }],
    }),
    createModule: builder.mutation<
      ModuleDto,
      { title: string; description?: string }
    >({
      query: (body) => ({
        url: `/api/v1/modules`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => normalizeModuleDto(raw),
      invalidatesTags: [{ type: 'Module', id: 'LIST' }],
    }),
    updateModule: builder.mutation<
      ModuleDto,
      { id: string; title?: string; description?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/modules/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (raw: unknown) => normalizeModuleDto(raw),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Module', id },
        { type: 'Module', id: 'LIST' },
      ],
    }),
    deleteModule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/modules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Module', id },
        { type: 'Module', id: 'LIST' },
      ],
    }),
    reorderConspects: builder.mutation<
      ModuleDto,
      { id: string; conspectIds: string[] }
    >({
      query: ({ id, conspectIds }) => ({
        url: `/api/v1/modules/${id}/reorder`,
        method: 'PATCH',
        body: { conspectIds },
      }),
      transformResponse: (raw: unknown) => normalizeModuleDto(raw),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Module', id },
        { type: 'Module', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useListModulesQuery,
  useGetModuleQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useReorderConspectsMutation,
} = moduleApi

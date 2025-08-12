import { supabase } from '@/lib/supabase'
import { Memo, MemoFormData } from '@/types/memo'
import { Database } from '@/types/database'

type MemoRow = Database['public']['Tables']['memos']['Row']
type MemoInsert = Database['public']['Tables']['memos']['Insert']
type MemoUpdate = Database['public']['Tables']['memos']['Update']

// Database row를 Memo 타입으로 변환하는 함수
const mapRowToMemo = (row: MemoRow): Memo => ({
  id: row.id,
  title: row.title,
  content: row.content,
  category: row.category,
  tags: row.tags,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

// Memo 타입을 Database insert 타입으로 변환하는 함수
const mapMemoToInsert = (formData: MemoFormData): MemoInsert => ({
  title: formData.title,
  content: formData.content,
  category: formData.category,
  tags: formData.tags,
})

// Memo 타입을 Database update 타입으로 변환하는 함수
const mapMemoToUpdate = (formData: MemoFormData): MemoUpdate => ({
  title: formData.title,
  content: formData.content,
  category: formData.category,
  tags: formData.tags,
})

export const memoService = {
  // 모든 메모 조회
  async getAllMemos(): Promise<Memo[]> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching memos:', error)
      throw new Error('Failed to fetch memos')
    }

    return data.map(mapRowToMemo)
  },

  // 특정 메모 조회
  async getMemoById(id: string): Promise<Memo | null> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // 메모를 찾을 수 없음
      }
      console.error('Error fetching memo:', error)
      throw new Error('Failed to fetch memo')
    }

    return mapRowToMemo(data)
  },

  // 메모 생성
  async createMemo(formData: MemoFormData): Promise<Memo> {
    const insertData = mapMemoToInsert(formData)
    
    const { data, error } = await supabase
      .from('memos')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating memo:', error)
      throw new Error('Failed to create memo')
    }

    return mapRowToMemo(data)
  },

  // 메모 업데이트
  async updateMemo(id: string, formData: MemoFormData): Promise<Memo> {
    const updateData = mapMemoToUpdate(formData)
    
    const { data, error } = await supabase
      .from('memos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating memo:', error)
      throw new Error('Failed to update memo')
    }

    return mapRowToMemo(data)
  },

  // 메모 삭제
  async deleteMemo(id: string): Promise<void> {
    const { error } = await supabase
      .from('memos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting memo:', error)
      throw new Error('Failed to delete memo')
    }
  },

  // 카테고리별 메모 조회
  async getMemosByCategory(category: string): Promise<Memo[]> {
    const query = supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false })

    if (category !== 'all') {
      query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching memos by category:', error)
      throw new Error('Failed to fetch memos by category')
    }

    return data.map(mapRowToMemo)
  },

  // 메모 검색
  async searchMemos(query: string): Promise<Memo[]> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching memos:', error)
      throw new Error('Failed to search memos')
    }

    return data.map(mapRowToMemo)
  },

  // 태그로 메모 검색
  async getMemosByTag(tag: string): Promise<Memo[]> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .contains('tags', [tag])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching memos by tag:', error)
      throw new Error('Failed to fetch memos by tag')
    }

    return data.map(mapRowToMemo)
  },

  // 모든 메모 삭제
  async clearAllMemos(): Promise<void> {
    const { error } = await supabase
      .from('memos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 행 삭제

    if (error) {
      console.error('Error clearing all memos:', error)
      throw new Error('Failed to clear all memos')
    }
  },
}

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Product = {
  id: number
  title: string
  description: string
  price: number
  thumbnail?: string
}

const LOCAL_PRODUCTS: Product[] = [
  { id: 1, title: 'Notebook Gamer X', description: '16GB RAM, RTX 3060', price: 4999 },
  { id: 2, title: 'Teclado Mecânico', description: 'Switches azuis, RGB', price: 299 },
  { id: 3, title: 'Mouse Óptico', description: '16000 DPI', price: 149 },
]
type AppState = {
  selectedProduct: Product | null
  cart: Product[]
  selectProduct: (p: Product | null) => void
  addToCart: (p: Product) => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<Product[]>([])

  function selectProduct(p: Product | null) {
    setSelectedProduct(p)
  }

  function addToCart(p: Product) {
    setCart(prev => {

      if (prev.find(item => item.id === p.id)) return prev
      return [...prev, p]
    })
  }

  return (
    <AppContext.Provider value={{ selectedProduct, cart, selectProduct, addToCart }}>
      {children}
    </AppContext.Provider>
  )
}
function LocalProductsList() {
  const { selectProduct, addToCart, selectedProduct } = useAppState()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {LOCAL_PRODUCTS.map(p => (
        <Card key={p.id} className={`p-3 ${selectedProduct?.id === p.id ? 'ring-2 ring-offset-2 ring-indigo-300' : ''}`}>
          <CardHeader>
            <h3 className="font-semibold">{p.title}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{p.description}</p>
            <p className="mt-2 font-medium">R$ {p.price.toFixed(2)}</p>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => selectProduct(p)}>Selecionar</Button>
              <Button onClick={() => addToCart(p)}>Adicionar ao carrinho</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CartSummary() {
  const { cart } = useAppState()
  const total = cart.reduce((s, p) => s + p.price, 0)
  return (
    <div className="p-4 border rounded">
      <h4 className="font-semibold">Carrinho</h4>
      <ul className="mt-2">
        {cart.length === 0 ? <li>Vazio</li> : cart.map(i => <li key={i.id}>{i.title} — R$ {i.price.toFixed(2)}</li>)}
      </ul>
      <div className="mt-3 font-bold">Total: R$ {total.toFixed(2)}</div>
    </div>
  )
}
function RemoteProducts() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState(false)
  const { addToCart } = useAppState()

  async function fetchFromDummy() {
    try {
      setLoading(true)
      const res = await fetch('https://dummyjson.com/products?limit=6')
      const json = await res.json()
      const products: Product[] = (json?.products || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        thumbnail: p.thumbnail || p.images?.[0],
      }))
      setResults(products)
    } catch (err) {
      console.error('Erro ao buscar dummyjson', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder="Buscar (ex: smartphone)" value={query} onChange={e => setQuery(e.target.value)} />
        <Button onClick={fetchFromDummy}>
          Buscar
        </Button>
      </div>

      {loading && <div>Carregando...</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results?.map(r => (
          <Card key={r.id} className="p-3">
            <CardHeader>
              <h3 className="font-semibold">{r.title}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{r.description}</p>
              <p className="mt-2 font-medium">R$ {r.price.toFixed(2)}</p>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => addToCart(r)}>Adicionar ao carrinho</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
export default function POSRevisaoPage() {
  const [name, setName] = useState('')

  return (
    <AppProvider>
      <main className="min-h-screen p-6 bg-slate-50">
        <header className="max-w-6xl mx-auto mb-6">
          <h1 className="text-2xl font-bold">Atividade: React - Revisão (POS)</h1>
          <p className="text-sm text-muted-foreground mt-1">Professor: L A Minora — Aluno: Micael Dantas</p>
        </header>

        <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card className="p-4">
              <CardHeader>
                <h2 className="text-lg font-semibold">UI com dados locais</h2>
              </CardHeader>
              <CardContent>
                <p className="mb-3">Essa seção usa variáveis locais (LOCAL_PRODUCTS) para renderizar uma UI estática.</p>
                <LocalProductsList />
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <h2 className="text-lg font-semibold">UI com dados remotos (dummyjson)</h2>
              </CardHeader>
              <CardContent>
                <p className="mb-3">Clique em "Buscar" para carregar produtos a partir da API pública.</p>
                <RemoteProducts />
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="p-4">
              <CardHeader>
                <h3 className="text-lg font-semibold">Resumo / Estado global</h3>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <label className="block text-sm">Seu nome:</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Digite seu nome" />
                </div>
                <CartSummary />
              </CardContent>
            </Card>
          </aside>
        </section>

        <footer className="max-w-6xl mx-auto mt-8 text-xs text-muted-foreground">
          <div>Atividade POS — Revisão • Exemplo implementado em Next + TypeScript + Tailwind + shadcn/ui</div>
        </footer>
      </main>
    </AppProvider>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Transaction = {
  id: number
  productName: string
  qty: number
  price: number
  amount: number
  platform: string
  location: string
}
export default function TransactionsPage() {

  const router = useRouter()

  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [search, setSearch] = useState("")
  const [platform, setPlatform] = useState("")
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [sortField, setSortField] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const [loading, setLoading] = useState(false)

  const API_URL = "http://localhost:3001/transactions"


  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(value)

    async function exportCSV() {
  const token = localStorage.getItem("token")

  const response = await fetch(
    "http://localhost:3001/transactions/export",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const blob = await response.blob()

  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")

  a.href = url
  a.download = "transactions.csv"

  a.click()

  window.URL.revokeObjectURL(url)
}

  async function fetchTransactions() {

    setLoading(true)

    try {

      const params = new URLSearchParams()

params.append("page", String(page))

if (search) params.append("search", search)
if (platform) params.append("platform", platform)
if (startDate) params.append("startDate", startDate)
if (endDate) params.append("endDate", endDate)
if (sortField) params.append("sortField", sortField)
if (sortOrder) params.append("sortOrder", sortOrder)

const token = localStorage.getItem("token")

console.log("sortField:", sortField)
console.log("sortOrder:", sortOrder)
console.log("params:", params.toString())

const res = await fetch(
  `${API_URL}?${params.toString()}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
)

const data = await res.json()

setTransactions(data.data ?? [])
setTotalPages(data.totalPages ?? 1)
setTotalTransactions(data.total ?? 0)

    } catch (err) {

      console.error(err)

    }

    setLoading(false)
  }


  useEffect(() => {
    fetchTransactions()
  }, [page, search, platform, startDate, endDate, sortField, sortOrder])


  function handleSort(field: string) {

    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }

  }


  return (

    <div className="p-8 bg-slate-950 min-h-screen text-slate-200">

      {/* HEADER */}

      <div className="mb-8">

<div className="mb-4">
  <button
    onClick={() => router.push("/")}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    ← Back to Dashboard
  </button>
</div>

        <h1 className="text-2xl font-semibold text-white">
          Transactions
        </h1>

        <p className="text-sm text-slate-400">
          Browse and analyze all sales transactions
        </p>

        <p className="text-sm text-green-400 mt-2">
  Total Transactions: {totalTransactions}
</p>

      </div>

      <div className="mb-4">
  <button
    onClick={exportCSV}
    className="px-4 py-2 bg-green-600 text-white rounded"
  >
    Export CSV
  </button>
</div>


      {/* FILTER BAR */}

      <div className="flex flex-wrap gap-4 mb-6">

        {/* SEARCH */}

        <input
          placeholder="Search product..."
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
          className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm"
        />


        {/* PLATFORM */}

        <select
  value={platform}
  onChange={(e) => {
    setPage(1)
    setPlatform(e.target.value)
  }}
  className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-sm"
>
  <option value="">All Platforms</option>
  <option value="Tokopedia">Tokopedia</option>
  <option value="Shopee">Shopee</option>
  <option value="Direct Transfer">Direct Transfer</option>
  <option value="Kang Lelang">Kang Lelang</option>
</select>


        {/* DATE */}

        <input
          type="date"
          value={startDate || ""}
          onChange={(e) => {
            setPage(1)
            setStartDate(e.target.value)
          }}
          className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-sm"
        />

        <input
          type="date"
          value={endDate || ""}
          onChange={(e) => {
            setPage(1)
            setEndDate(e.target.value)
          }}
          className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-sm"
        />

      </div>



      {/* TABLE */}

      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">

        <table className="w-full text-sm table-fixed">

          <thead className="bg-slate-900 border-b border-slate-800 text-slate-300">

            <tr>
  <th
    onClick={() => handleSort("productName")}
    className="p-4 text-left cursor-pointer hover:text-white"
  >
    Product
  </th>

  <th
    onClick={() => handleSort("qty")}
    className="p-4 text-center cursor-pointer hover:text-white"
  >
    Qty
  </th>

  <th
    onClick={() => handleSort("price")}
    className="p-4 text-right cursor-pointer hover:text-white"
  >
    Price
  </th>

  <th
    onClick={() => handleSort("amount")}
    className="p-4 text-right cursor-pointer hover:text-white"
  >
    Amount
  </th>

  <th className="p-4 text-left">
    Platform
  </th>

  <th className="p-4 text-left">
    Location
  </th>
</tr>

          </thead>


          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan={5}
                  className="text-center p-8 text-slate-400"
                >
                  Loading transactions...
                </td>

              </tr>

            )}


            {!loading && transactions.length === 0 && (

              <tr>

                <td
                  colSpan={5}
                  className="text-center p-8 text-slate-400"
                >
                  No transactions found
                </td>

              </tr>

            )}


            {!loading && transactions.map((t) => (

              <tr
                key={t.id}
                className="border-b border-slate-800 hover:bg-slate-900 transition"
              >

                

<td className="p-4 text-left">
  {t.productName}
</td>

<td className="p-4 text-center">
  {t.qty}
</td>

<td className="p-4 text-right">
  {formatRupiah(t.price)}
</td>

<td className="p-4 text-right">
  {formatRupiah(t.amount)}
</td>

<td className="p-4 text-left">
  {t.platform}
</td>

<td className="p-4 text-left">
  {t.location}
</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>



      {/* PAGINATION */}

      <div className="flex items-center gap-4 mt-6">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-slate-800 rounded-md hover:bg-slate-700 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-sm text-slate-400">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-slate-800 rounded-md hover:bg-slate-700 disabled:opacity-40"
        >
          Next
        </button>

      </div>

    </div>

  )
}
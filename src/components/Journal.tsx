"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, BookOpen, ChevronLeft, ChevronRight, Menu } from "lucide-react"
import type { AppDispatch } from "@/store"
import type { RootState } from "@/store"
import { useDispatch, useSelector } from "react-redux"
import { format } from "date-fns"
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createEntry, fetchEntries } from "@/features/entry"

// Custom sidebar trigger that works when sidebar is collapsed
const CustomSidebarTrigger = () => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-50 bg-black text-white border-3 border-white backdrop-blur-sm shadow-sm"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export default function JournalLayout() {
  const [currentView, setCurrentView] = useState<"new" | "index" | "entry">("new")
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null)
  const [newEntryContent, setNewEntryContent] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)
  const dispatch = useDispatch<AppDispatch>()
  const entries = useSelector((state: RootState) => state.entry.entries)
  const entriesPerPage = 20
  const totalPages = Math.ceil(entries.length / entriesPerPage)
  const entryPageRef = useRef<HTMLDivElement>(null)

  const sortedEntries = [...entries]
    .map((entry) => ({
      ...entry,
      date: new Date(entry.date),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      dispatch(fetchEntries(token))
    }
  }, [dispatch])

  const handleNewEntry = () => {
    setCurrentView("new")
    setCurrentCarouselIndex(0)
  }

  const handleIndexView = () => {
    setCurrentView("index")
    setCurrentCarouselIndex(0)
  }

  const handleEntryView = (id: number) => {
    setCurrentView("entry")
    setCurrentEntryId(id)
    const entryIndex = sortedEntries.findIndex((entry) => entry.id === id)
    setCurrentCarouselIndex(entryIndex)
  }

  const handleSaveNewEntry = async () => {
    if (newEntryContent.trim()) {
      try {
        await dispatch(
          createEntry({
            newEntryContent,
          }),
        ).unwrap()
        setNewEntryContent("")
      } catch (error: any) {
        // Handle error
      }
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextCarousel = () => {
    if (currentView === "entry" && currentCarouselIndex < entries.length - 1) {
      setCurrentCarouselIndex(currentCarouselIndex + 1)
      setCurrentEntryId(sortedEntries[currentCarouselIndex + 1].id)
    }
  }

  const handlePrevCarousel = () => {
    if (currentView === "entry" && currentCarouselIndex > 0) {
      setCurrentCarouselIndex(currentCarouselIndex - 1)
      setCurrentEntryId(sortedEntries[currentCarouselIndex - 1].id)
    }
  }

  return (
    <div>
      <div className="absolute z-2">
      <SidebarProvider>
      <div className="flex min-h-screen bg-stone-100">
        <Sidebar variant="floating" collapsible="offcanvas" className="z-50 bg-gray-700">
          <SidebarHeader className="p-4 pt-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Chaotic's Journal</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleNewEntry}>
                  <Plus className="mr-2" />
                  <span>New Entry</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleIndexView}>
                  <BookOpen className="mr-2" />
                  <span>Index</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="mt-6 px-3">
              <h3 className="text-sm font-medium mb-2">Recent Entries</h3>
              <SidebarMenu>
                {sortedEntries.map((entry) => (
                  <SidebarMenuItem key={entry.id}>
                    <SidebarMenuButton onClick={() => handleEntryView(entry.id)} isActive={currentEntryId === entry.id}>
                      <span>{entry.date.toDateString()}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Custom sidebar trigger when sidebar is collapsed */}
        <CustomSidebarTrigger />
      </div>
    </SidebarProvider>
      </div>
      <main className="absolute z-1 bg-gray-700 flex-1 w-full h-dvh flex items-center justify-center p-6">
        {/* Entry page container */}
        <div
          ref={entryPageRef}
          className="w-[90%] md:w-[50%] md:max-w-[900px] md:min-w-[700px] h-[90%] bg-white rounded-md shadow-lg relative mx-auto overflow-hidden"
          style={{
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.07)",
          }}
        >
          {/* Fade effects for top and bottom */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

          {/* Scrollable content area */}
          <div className="h-full overflow-y-auto scrollbar-hide px-8 py-12">
            {/* New Entry View */}
            {currentView === "new" && (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif font-bold">New Journal Entry</h2>
                  <Button onClick={handleSaveNewEntry}>Save Entry</Button>
                </div>
                <Textarea
                  className="flex-1 resize-none mb-4 p-4 text-lg font-serif border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Write your thoughts here..."
                  value={newEntryContent}
                  onChange={(e) => setNewEntryContent(e.target.value)}
                />
              </div>
            )}

            {/* Index View */}
            {currentView === "index" && (
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-serif font-bold mb-6">Journal Index</h2>
                <div className="flex-1">
                  <div className="flex flex-col gap-3">
                    {sortedEntries
                      .slice(currentPage * entriesPerPage, (currentPage + 1) * entriesPerPage)
                      .map((entry, index) => (
                        <div
                          key={entry.id}
                          className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleEntryView(entry.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">
                                Entry #{sortedEntries.length - index}
                              </span>
                              <span className="font-medium">{format(entry.date, "MMMM d, yyyy")}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 0}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1}
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Entry View */}
            {currentView === "entry" && currentEntryId && (
              <div className="h-full flex flex-col">
                {sortedEntries.findIndex((e) => e.id === currentEntryId) !== -1 && (
                  <>
                    <div className="text-center mb-8">
                      <div className="text-4xl font-serif font-bold mb-1">
                        Entry #{sortedEntries.length - currentCarouselIndex}
                      </div>
                      <div className="text-xl font-medium text-gray-700">
                        {format(sortedEntries.find((e) => e.id === currentEntryId)!.date, "eeee, MMMM d, yyyy")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(sortedEntries.find((e) => e.id === currentEntryId)!.date, "h:mm a")}
                      </div>
                    </div>
                    <div className="flex-1 font-serif text-lg leading-relaxed whitespace-pre-wrap">
                      {sortedEntries.find((e) => e.id === currentEntryId)!.content}
                    </div>
                    <div className="mt-8 flex justify-center">
                      <span className="text-sm text-muted-foreground">
                        Entry {currentCarouselIndex + 1} of {sortedEntries.length}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Carousel Navigation for Entry View */}
          {currentView === "entry" && (
            <div className="absolute top-1/2 left-0 -translate-y-1/2 flex justify-between w-full px-4 pointer-events-none">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-sm shadow-md pointer-events-auto"
                onClick={handlePrevCarousel}
                disabled={currentCarouselIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-sm shadow-md pointer-events-auto"
                onClick={handleNextCarousel}
                disabled={currentCarouselIndex === sortedEntries.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

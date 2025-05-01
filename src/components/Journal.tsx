"use client"

import { useState, useEffect } from "react"
import { Plus, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { AppDispatch } from "@/store";
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {createEntry, fetchEntries} from "@/features/entry"


export default function JournalLayout() {
  const [currentView, setCurrentView] = useState<"new" | "index" | "entry">("new")
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null)
  const [newEntryContent, setNewEntryContent] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)
  const dispatch = useDispatch<AppDispatch>();
  const entries = useSelector((state: RootState) => state.entry.entries)
  const entriesPerPage = 20
  const totalPages = Math.ceil(entries.length / entriesPerPage)

  const sortedEntries = [...entries]
  .map((entry) => ({
    ...entry,
    date: new Date(entry.date),  // Parse the date string to a Date object
  }))
  .sort((a, b) => b.date.getTime() - a.date.getTime());

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
    setCurrentView("entry");
    setCurrentEntryId(id);
    const entryIndex = sortedEntries.findIndex((entry) => entry.id === id);
    setCurrentCarouselIndex(entryIndex);
  }

  const handleSaveNewEntry = async () => {
    if (newEntryContent.trim()) {
      try{
        await dispatch(
          createEntry({
            newEntryContent
          })
        ).unwrap();
        setNewEntryContent("")
      }
      catch(error: any){

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
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="w-[10%] min-w-[200px]">
          <SidebarHeader className="p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Journal</h2>
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

        <main className="flex-1 p-6 overflow-hidden ml-5">
          <div className="h-full w-dvh">
            {currentView === "new" && (
              <div className="h-full w-dvh flex flex-col">
                <div className="flex-1 w-dvh relative">
                  <Card className="p-6  w-dvh h-full flex flex-col">
                  <h2 className="text-2xl font-bold mb-4">New Journal Entry</h2>
                <Textarea
                  className="flex-1 resize-none mb-4 p-4 text-2xl"
                  placeholder="Write your thoughts here..."
                  value={newEntryContent}
                  onChange={(e) => setNewEntryContent(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSaveNewEntry}>Save Entry</Button>
                </div>
                  </Card>
                </div>
              </div>
            )}

            {currentView === "index" && (
              <Card className="p-6 h-full flex flex-col w-full">
                <h2 className="text-2xl font-bold mb-4">Journal Index</h2>
                <div className="flex-1 overflow-auto">
                  <div className="flex flex-col gap-2">
                    {sortedEntries
                      .slice(currentPage * entriesPerPage, (currentPage + 1) * entriesPerPage)
                      .map((entry, index) => (
                        <Button
                          key={entry.id}
                          variant="outline"
                          className="w-full py-4 flex justify-between items-center text-left"
                          onClick={() => handleEntryView(entry.id)}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Entry # {index+1}</span>
                          </div>
                          
                        </Button>
                      ))}
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 0}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <span>
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
              </Card>
            )}

            {currentView === "entry" && currentEntryId && (
              <div className="h-full w-dvh flex flex-col">
                <div className="flex-1 h-full w-dvh relative">
                  <Card className="p-6 w-dvh h-full flex flex-col">
                    {sortedEntries.findIndex((e) => e.id === currentEntryId) !== -1 && (
                      <>
                        <div className="flex justify-center text-6xl font-bold underline">
                          Entry # {currentCarouselIndex + 1}
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-2xl font-bold">
                            {format(sortedEntries.find((e) => e.id === currentEntryId)!.date, "eeee, MMMM d, yyyy")}
                          </h2>
                          <span className="text-muted-foreground">
                            {format(sortedEntries.find((e) => e.id === currentEntryId)!.date, "h:mm a")}
                          </span>
                        </div>
                        <ScrollArea className="flex-1 pr-4">
                          <div className="text-lg whitespace-pre-wrap">
                            {sortedEntries.find((e) => e.id === currentEntryId)!.content}
                          </div>
                        </ScrollArea>
                      </>
                    )}
                    <div className="mt-4 flex justify-center">
                      <span className="text-sm text-muted-foreground">
                        Entry {currentCarouselIndex + 1} of {sortedEntries.length}
                      </span>
                    </div>
                  </Card>

                  {/* Carousel Navigation */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 flex justify-between w-full px-4 pointer-events-none">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-background shadow-md pointer-events-auto"
                      onClick={handlePrevCarousel}
                      disabled={currentCarouselIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-background shadow-md pointer-events-auto"
                      onClick={handleNextCarousel}
                      disabled={currentCarouselIndex === sortedEntries.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

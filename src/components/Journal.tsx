"use client"

import { useState, useEffect, useRef } from "react"
import {
  Plus,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  Edit,
  Trash2,
  Book,
  BookOpenText,

  Earth,
  Code,
  CodeXml,
  LibraryBig,
  Telescope,
  AudioWaveform,
  BookUser,
  Eclipse,
  LoaderPinwheel,
  Rotate3D
} from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  createEntry,
  fetchEntries,
  createCategory,
  fetchCategories,
  deleteCategory,
  updateCategory,
} from "@/features/entry"
import { CategoryDialog } from "@/components/CategoryDialog"

enum TitleStyle {
  AUTO_NUMBER = "AUTO_NUMBER",
  CUSTOM_TITLE = "CUSTOM_TITLE",
  CUSTOM_AND_AUTO = "CUSTOM_AND_AUTO",
}

interface Category {
  id: number | undefined
  name: string
  icon: string
  titleStyle: TitleStyle
  recordDateTime: boolean
}

export const iconOptions = [
  { name: "Book", icon: Book },
  { name: "BookOpen", icon: BookOpen },
  { name: "BookUser", icon: BookUser },
  { name: "LibraryBig", icon: LibraryBig },
  { name: "Code", icon: Code },
  { name: "CodeXml", icon: CodeXml },
  { name: "AudioWaveform", icon: AudioWaveform },
  { name: "Telescope", icon: Telescope },
  { name: "Earth", icon: Earth },
  { name: "Eclipse", icon: Eclipse },
  { name: "Rotate3D", icon: Rotate3D },
  { name: "LoaderPinwheel", icon: LoaderPinwheel },
]

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

export  function Journal() {
  const [currentView, setCurrentView] = useState<"new" | "index" | "entry">("new")
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [categoryDialogMode, setCategoryDialogMode] = useState<"new" | "edit">("new")
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null)
  const [newEntryContent, setNewEntryContent] = useState("")
  const [newEntryTitle, setNewEntryTitle] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [newEntryCategory, setNewEntryCategory] = useState<Category | null>(null)
  const dispatch = useDispatch<AppDispatch>()
  const entries = useSelector((state: RootState) => state.entry.entries)
  const categories = useSelector((state: RootState) => state.entry.categories)
  const entriesPerPage = 8
  const totalPages = Math.ceil(entries.length / entriesPerPage)
  const entryPageRef = useRef<HTMLDivElement>(null)
  let sortedEntries = [...entries]
    .map((entry) => ({
      ...entry,
      date: new Date(entry.date),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  useEffect(() => {
    sortedEntries = [...entries]
      .map((entry) => ({
        ...entry,
        date: new Date(entry.date),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [entries])

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (token) {
      dispatch(fetchCategories(token))
    }
  }, [dispatch])

  useEffect(() => {
    if (categories?.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0])
      const token = sessionStorage.getItem("token");
      if(token){
        dispatch(fetchEntries({token,category: categories[0].id}))
      }
    }
  }, [categories, selectedCategory])

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

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
    const token = sessionStorage.getItem("token");
    if(token){
      dispatch(fetchEntries({token,category:category.id}))
    }
  }

  const handleSaveNewEntry = async () => {
    if(newEntryCategory === null){
      return
    }
    if (newEntryContent.trim()) {
      try {
        console.log("Saving entry with category:", newEntryCategory)
        await dispatch(
          createEntry({
            newEntryContent,
            newEntryTitle,
            categoryId: newEntryCategory.id,
          }),
        ).unwrap()
        setNewEntryContent("")
        setNewEntryTitle("")
      } catch (error: any) {

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

  const handleNewCategory = () => {
    setCategoryDialogMode("new")
    setEditingCategory(undefined)
    setShowCategoryDialog(true)
  }

  const handleEditCategory = (category: Category) => {
    setCategoryDialogMode("edit")
    setEditingCategory(category)
    setShowCategoryDialog(true)
  }

  const handleDeleteCategory = async (categoryId: number) => {
    const token = sessionStorage.getItem("token")
    if(token){
      await dispatch(deleteCategory({token, categoryId}))
      await dispatch(fetchCategories(token))
      console.log(categories)
    }
  }

  const handleSaveCategory = async (categoryData: Category) => {
    if (categoryDialogMode === "new") {
      const token = sessionStorage.getItem("token")
        try{
          if (token) {
            await dispatch(
              createCategory({
                name: categoryData.name,
                icon: categoryData.icon,
                recordDateTime: categoryData.recordDateTime,
                titleStyle: categoryData.titleStyle,
            }),
           ).unwrap()
            await dispatch(fetchCategories(token))
          }
        }
        catch(error: any){

        }
    }
    else if (editingCategory) {
      const token = sessionStorage.getItem("token")
        try{
          if (token) {
            await dispatch(
              updateCategory({
                id: categoryData.id,
                name: categoryData.name,
                icon: categoryData.icon,
                recordDateTime: categoryData.recordDateTime,
                titleStyle: categoryData.titleStyle,
            }),
           ).unwrap()
            await dispatch(fetchCategories(token))
          }
        }
        catch(error: any){

        }
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find((opt) => opt.name === iconName)
    return iconOption ? iconOption.icon : CodeXml
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

                <div className="mt-6 px-3">
                  <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleNewEntry}>
                      <Plus className="mr-2" />
                      <span>New Entry</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleIndexView}>
                      <BookOpenText className="mr-2" />
                      <span>Index</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                </div>

                <div className="mt-6 px-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Categories</h3>
                    <Button variant="ghost" size="sm" onClick={handleNewCategory} className="h-6 w-6 p-0">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <SidebarMenu>
                    {Array.isArray(categories) && categories.map((category) => {
                      const IconComponent = getIconComponent(category.icon)
                      return (
                        <SidebarMenuItem key={category.id}>
                          <div className="flex items-center justify-between w-full">
                            <div
                              className={`flex items-center gap-2 flex-1 px-2 py-1 rounded-md cursor-pointer w-[80%] truncate hover:bg-sidebar-accent transition-colors ${
                                selectedCategory?.id === category.id ? "bg-gray-200" : ""
                              }`}
                              onClick={() => {handleCategoryClick(category);handleIndexView();}}
                            >
                              <IconComponent className="h-4 w-4" />
                              <span className="text-sm">{category.name}</span>
                            </div>
                            <div className="flex gap-1 px-1 w-[20%]">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditCategory(category)
                                }}
                                className="h-6 w-6 p-0 hover:bg-sidebar-accent-foreground/10"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteCategory(category.id)
                                }}
                                className="h-6 w-6 p-0 hover:bg-red-500/10 hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </div>
              </SidebarContent>
            </Sidebar>

            <CustomSidebarTrigger />
          </div>
        </SidebarProvider>
      </div>

      <main className="absolute z-1 bg-gray-700 flex-1 w-full h-dvh flex items-center justify-center p-6">
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
          <div className="h-full overflow-y-auto scrollbar-hide px-6 py-10">
            {/* New Entry View */}
            {currentView === "new" && (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif font-bold">New Journal Entry</h2>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-3 flex-col sm:flex-row w-[50%] sm:w-[100%]">
                      <Label htmlFor="category-select" className="text-sm font-medium">
                        Category:
                      </Label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={newEntryCategory?.id?.toString() || ""}
                          onValueChange={(value) => setNewEntryCategory(categories.find((e) => e.id === parseInt(value)) ?? null)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(categories) && categories.map((category) => {
                              const IconComponent = getIconComponent(category.icon)
                              return (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    <span>{category.name}</span>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSaveNewEntry}>Save Entry</Button>
                    </div>
                  </div>
                </div>
                {newEntryCategory !== null &&(
                  <div className="h-[100%]">
                    {newEntryCategory?.titleStyle !== "AUTO_NUMBER" &&(
                      <Textarea
                        className="border-none h-[10%] focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-xl font-serif"
                        placeholder="A Title for this entry"
                        value={newEntryTitle}
                        onChange={(e) => {setNewEntryTitle(e.target.value)}}
                      />
                    )}
                    <Textarea
                      className="flex-1 resize-none h-[90%] p-4 text-lg font-serif border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Write your thoughts here..."
                      value={newEntryContent}
                      onChange={(e) => setNewEntryContent(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {currentView === "index" && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-center flex-col">
                  <h2 className="text-2xl font-bold">{selectedCategory?.name}</h2>
                  <h2 className="text-md font-bold mb-6">({entries?.length} entries)</h2>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col gap-3">
                    {sortedEntries
                      .slice(currentPage * entriesPerPage, (currentPage + 1) * entriesPerPage)
                      .map((entry, index) => (
                        <div
                          key={entry.id}
                          className="sm:p-4 p-1 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleEntryView(entry.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              {selectedCategory?.titleStyle == "AUTO_NUMBER" &&(
                                <span className="font-medium">Entry #{sortedEntries.length - index - ((currentPage)*entriesPerPage)}</span>
                              )}
                              {selectedCategory?.titleStyle == "CUSTOM_TITLE" &&(
                                <span className="font-medium">{entry.title}</span>
                              )}
                              {selectedCategory?.titleStyle == "CUSTOM_AND_AUTO" &&(
                                <span className="font-medium">Entry #{sortedEntries.length - index}: {entry.title}</span>
                              )}
                              {selectedCategory?.recordDateTime &&(
                                <span className="text-sm text-muted-foreground">
                                  {format(entry.date, "MMMM d, yyyy")}
                                </span>
                              )}
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-between sm:justify-center sm:gap-4 items-center pt-4">
                    <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 0}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
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
                      { selectedCategory?.titleStyle !== "CUSTOM_TITLE" && (
                        <div className="text-4xl font-bold mb-1">
                          Entry #{sortedEntries.length - currentCarouselIndex}
                        </div>
                      )}
                      {selectedCategory?.titleStyle !== "AUTO_NUMBER" && (
                        <div className="text-4xl font-bold mb-1">
                          {sortedEntries.find((e) => e.id === currentEntryId)!.title}
                        </div>
                      )}
                      {selectedCategory?.recordDateTime && (
                        <div>
                          <div className="text-xl font-medium text-gray-700">
                            {format(sortedEntries.find((e) => e.id === currentEntryId)!.date, "eeee, MMMM d, yyyy")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(sortedEntries.find((e) => e.id === currentEntryId)!.date, "h:mm a")}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 font-serif text-lg leading-relaxed whitespace-pre-wrap">
                      {sortedEntries.find((e) => e.id === currentEntryId)!.content}
                    </div>
                    <div className="mt-8 flex justify-center">
                      <span className="text-sm text-muted-foreground">
                        Entry {sortedEntries.length - currentCarouselIndex} of {sortedEntries.length}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Carousel Navigation for Entry View */}
          {currentView === "entry" && (
            <div className="absolute top-[5%] flex justify-between w-full px-4 pointer-events-none ">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-sm shadow-md pointer-events-auto"
                onClick={handleNextCarousel}
                disabled={currentCarouselIndex === sortedEntries.length - 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-sm shadow-md pointer-events-auto"
                onClick={handlePrevCarousel}
                disabled={currentCarouselIndex === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Category Dialog */}
      <CategoryDialog
        isOpen={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        mode={categoryDialogMode}
        category={editingCategory}
        onSave={handleSaveCategory}
      />
    </div>
  )
}

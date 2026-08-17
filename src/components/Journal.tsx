"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Book,
  Lock,
  NotebookPen,
  Earth,
  Code,
  CodeXml,
  LibraryBig,
  Telescope,
  AudioWaveform,
  BookUser,
  Eclipse,
  LoaderPinwheel,
  Rotate3D,
} from "lucide-react";
import type { AppDispatch } from "@/store";
import type { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import Sidebar, { type SidebarCategory } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEntry,
  fetchEntries,
  createCategory,
  fetchCategories,
  deleteCategory,
  updateCategory,
} from "@/features/entry";
import { logout } from "@/features/auth";
import { CategoryDialog } from "@/components/CategoryDialog";

enum TitleStyle {
  AUTO_NUMBER = "AUTO_NUMBER",
  CUSTOM_TITLE = "CUSTOM_TITLE",
  CUSTOM_AND_AUTO = "CUSTOM_AND_AUTO",
}

interface Category {
  id: number | undefined;
  name: string;
  icon: string;
  titleStyle: TitleStyle;
  recordDateTime: boolean;
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
];

export function Journal() {
  const [currentView, setCurrentView] = useState<"new" | "index" | "entry">(
    "new",
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 768,
  );
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categoryDialogMode, setCategoryDialogMode] = useState<"new" | "edit">(
    "new",
  );
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [newEntryContent, setNewEntryContent] = useState("");
  const [newEntryTitle, setNewEntryTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [newEntryCategory, setNewEntryCategory] = useState<Category | null>(
    null,
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const entries = useSelector((state: RootState) => state.entry.entries);
  const categories = useSelector((state: RootState) => state.entry.categories);
  const entriesPerPage = 8;
  const totalPages = Math.ceil(entries.length / entriesPerPage);
  const entryPageRef = useRef<HTMLDivElement>(null);
  let sortedEntries = [...entries]
    .map((entry) => ({
      ...entry,
      date: new Date(entry.date),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  useEffect(() => {
    sortedEntries = [...entries]
      .map((entry) => ({
        ...entry,
        date: new Date(entry.date),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      dispatch(fetchCategories(token));
    }
  }, [dispatch]);

  useEffect(() => {
    if (categories?.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
      const token = sessionStorage.getItem("token");
      if (token) {
        dispatch(fetchEntries({ token, category: categories[0].id }));
      }
    }
  }, [categories, selectedCategory]);

  const handleNewEntry = () => {
    setCurrentView("new");
    setCurrentCarouselIndex(0);
  };

  const handleIndexView = () => {
    setCurrentView("index");
    setCurrentPage(0);
    setCurrentCarouselIndex(0);
  };

  const handleEntryView = (id: number) => {
    setCurrentView("entry");
    setCurrentEntryId(id);
    const entryIndex = sortedEntries.findIndex((entry) => entry.id === id);
    setCurrentCarouselIndex(entryIndex);
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    const token = sessionStorage.getItem("token");
    if (token) {
      dispatch(fetchEntries({ token, category: category.id }));
    }
  };

  const handleSaveNewEntry = async () => {
    if (newEntryCategory === null) {
      return;
    }
    if (newEntryContent.trim()) {
      try {
        console.log("Saving entry with category:", newEntryCategory);
        await dispatch(
          createEntry({
            newEntryContent,
            newEntryTitle,
            categoryId: newEntryCategory.id,
          }),
        ).unwrap();
        setNewEntryContent("");
        setNewEntryTitle("");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextCarousel = () => {
    if (currentView === "entry" && currentCarouselIndex < entries.length - 1) {
      setCurrentCarouselIndex(currentCarouselIndex + 1);
      setCurrentEntryId(sortedEntries[currentCarouselIndex + 1].id);
    }
  };

  const handlePrevCarousel = () => {
    if (currentView === "entry" && currentCarouselIndex > 0) {
      setCurrentCarouselIndex(currentCarouselIndex - 1);
      setCurrentEntryId(sortedEntries[currentCarouselIndex - 1].id);
    }
  };

  const handleNewCategory = () => {
    setCategoryDialogMode("new");
    setEditingCategory(undefined);
    setShowCategoryDialog(true);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryDialogMode("edit");
    setEditingCategory(category);
    setShowCategoryDialog(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      await dispatch(deleteCategory({ token, categoryId }));
      await dispatch(fetchCategories(token));
      console.log(categories);
    }
  };

  const handleSaveCategory = async (categoryData: Category) => {
    if (categoryDialogMode === "new") {
      const token = sessionStorage.getItem("token");
      try {
        if (token) {
          await dispatch(
            createCategory({
              name: categoryData.name,
              icon: categoryData.icon,
              recordDateTime: categoryData.recordDateTime,
              titleStyle: categoryData.titleStyle,
            }),
          ).unwrap();
          await dispatch(fetchCategories(token));
        }
      } catch (error: any) {}
    } else if (editingCategory) {
      const token = sessionStorage.getItem("token");
      try {
        if (token) {
          await dispatch(
            updateCategory({
              id: categoryData.id,
              name: categoryData.name,
              icon: categoryData.icon,
              recordDateTime: categoryData.recordDateTime,
              titleStyle: categoryData.titleStyle,
            }),
          ).unwrap();
          await dispatch(fetchCategories(token));
        }
      } catch (error: any) {}
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find((opt) => opt.name === iconName);
    return iconOption ? iconOption.icon : CodeXml;
  };

  const handleLock = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const safeCategories = Array.isArray(categories) ? categories : [];

  const navItems: SidebarCategory[] = [
    {
      category: "Journal",
      icon: NotebookPen,
      items: [
        {
          id: "new",
          label: "New Entry",
          icon: Plus,
          active: currentView === "new",
        },
      ],
    },
    {
      category: "Categories",
      icon: LibraryBig,
      collapsible: false,
      action: { label: "Add category", icon: Plus, onClick: handleNewCategory },
      emptyHint: "No categories yet. Click + to create one.",
      items: safeCategories.map((category) => ({
        id: `category-${category.id}`,
        label: category.name,
        icon: getIconComponent(category.icon),
        active: currentView !== "new" && selectedCategory?.id === category.id,
        actions: [
          {
            label: "Edit",
            icon: Edit,
            onClick: () => handleEditCategory(category),
          },
          {
            label: "Delete",
            icon: Trash2,
            destructive: true,
            onClick: () => handleDeleteCategory(category.id),
          },
        ],
      })),
    },
  ];

  const handleSidebarNavigate = (id: string) => {
    if (id === "new") {
      handleNewEntry();
    } else if (id === "lock") {
      handleLock();
    } else if (id.startsWith("category-")) {
      const category = safeCategories.find((c) => `category-${c.id}` === id);
      if (category) {
        handleCategoryClick(category);
        handleIndexView();
      }
    }
  };

  return (
    <div>
      <Sidebar
        navItems={navItems}
        setActiveComponent={handleSidebarNavigate}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        portalName="Chaotic's Journal"
        portalSubtitle="Personal notebook"
        portalIcon={NotebookPen}
        footerItems={[{ id: "lock", label: "Lock journal", icon: Lock }]}
      />

      <main className="absolute z-1 bg-gradient-to-br from-stone-800 to-stone-900 flex-1 w-full h-dvh flex items-center justify-center p-6 md:pl-24">
        <div
          ref={entryPageRef}
          className="font-journal h-[95vh] aspect-[9/16] w-auto max-w-full bg-white rounded-md shadow-lg relative mx-auto overflow-hidden"
          style={{
            boxShadow:
              "0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.07)",
          }}
        >
          {/* Fade effects for top and bottom */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

          {/* Scrollable content area */}
          <div className="h-full overflow-y-auto scrollbar-hide px-6 py-8">
            {/* New Entry View */}
            {currentView === "new" && (
              <div className="h-full flex flex-col">
                <div className="mb-6 flex flex-col gap-3">
                  <h2 className="text-xl font-bold whitespace-nowrap">
                    New Journal Entry
                  </h2>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="category-select"
                      className="shrink-0 text-sm font-medium"
                    >
                      Category:
                    </Label>
                    <Select
                      value={newEntryCategory?.id?.toString() || ""}
                      onValueChange={(value) =>
                        setNewEntryCategory(
                          categories.find((e) => e.id === parseInt(value)) ??
                            null,
                        )
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(categories) &&
                          categories.map((category) => {
                            const IconComponent = getIconComponent(
                              category.icon,
                            );
                            return (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  <span>{category.name}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleSaveNewEntry} className="ml-auto">
                      Save Entry
                    </Button>
                  </div>
                </div>
                {newEntryCategory !== null && (
                  <div className="h-[100%]">
                    {newEntryCategory?.titleStyle !== "AUTO_NUMBER" && (
                      <Textarea
                        className="border-none h-[10%] focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-xl md:text-xl font-semibold"
                        placeholder="A Title for this entry"
                        value={newEntryTitle}
                        onChange={(e) => {
                          setNewEntryTitle(e.target.value);
                        }}
                      />
                    )}
                    <Textarea
                      className="notebook-lines flex-1 resize-none h-[90%] rounded-none border-none px-2 py-0 text-base md:text-base leading-8 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  <h2 className="text-2xl font-bold">
                    {selectedCategory?.name}
                  </h2>
                  <h2 className="text-md font-bold mb-6">
                    ({entries?.length} entries)
                  </h2>
                </div>

                <div className="flex-1">
                  <div className="grid grid-rows-8 h-full">
                    {sortedEntries
                      .slice(
                        currentPage * entriesPerPage,
                        (currentPage + 1) * entriesPerPage,
                      )
                      .map((entry, index) => (
                        <div
                          key={entry.id}
                          className="sm:p-4 p-1 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleEntryView(entry.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              {selectedCategory?.titleStyle ==
                                "AUTO_NUMBER" && (
                                <span className="font-medium">
                                  Entry #
                                  {sortedEntries.length -
                                    index -
                                    currentPage * entriesPerPage}
                                </span>
                              )}
                              {selectedCategory?.titleStyle ==
                                "CUSTOM_TITLE" && (
                                <span className="font-medium">
                                  {entry.title}
                                </span>
                              )}
                              {selectedCategory?.titleStyle ==
                                "CUSTOM_AND_AUTO" && (
                                <span className="font-medium">
                                  Entry #{sortedEntries.length - index}:{" "}
                                  {entry.title}
                                </span>
                              )}
                              {selectedCategory?.recordDateTime && (
                                <span className="text-sm text-muted-foreground">
                                  {format(entry.date, "MMMM d, yyyy")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-between sm:justify-center sm:gap-4 items-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                    >
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
                {sortedEntries.findIndex((e) => e.id === currentEntryId) !==
                  -1 && (
                  <>
                    <div className="text-center mb-8">
                      {selectedCategory?.titleStyle !== "CUSTOM_TITLE" && (
                        <div className="text-3xl font-bold mb-1">
                          Entry #{sortedEntries.length - currentCarouselIndex}
                        </div>
                      )}
                      {selectedCategory?.titleStyle !== "AUTO_NUMBER" && (
                        <div className="text-3xl font-bold mb-1">
                          {
                            sortedEntries.find((e) => e.id === currentEntryId)!
                              .title
                          }
                        </div>
                      )}
                      {selectedCategory?.recordDateTime && (
                        <div>
                          <div className="text-xl font-medium text-gray-700">
                            {format(
                              sortedEntries.find(
                                (e) => e.id === currentEntryId,
                              )!.date,
                              "eeee, MMMM d, yyyy",
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(
                              sortedEntries.find(
                                (e) => e.id === currentEntryId,
                              )!.date,
                              "h:mm a",
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="notebook-lines flex-1 px-2 text-base leading-8 whitespace-pre-wrap">
                      {
                        sortedEntries.find((e) => e.id === currentEntryId)!
                          .content
                      }
                    </div>
                    <div className="mt-8 flex justify-center">
                      <span className="text-sm text-muted-foreground">
                        Entry {sortedEntries.length - currentCarouselIndex} of{" "}
                        {sortedEntries.length}
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
              {currentCarouselIndex !== sortedEntries.length - 1 ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-background/80 backdrop-blur-sm shadow-md pointer-events-auto"
                  onClick={handleNextCarousel}
                  disabled={currentCarouselIndex === sortedEntries.length - 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-transparent border-none shadow-none"
                ></Button>
              )}
              {currentCarouselIndex !== 0 ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-background/80 backdrop-blur-sm shadow-md pointer-events-auto"
                  onClick={handlePrevCarousel}
                  disabled={currentCarouselIndex === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-transparent border-none shadow-none"
                ></Button>
              )}
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
  );
}

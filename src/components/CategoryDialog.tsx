// components/CategoryDialog.tsx

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { Heart } from "lucide-react"
import { iconOptions } from "@/components/Journal"

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

type CategoryDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: "new" | "edit"
  category?: Category
  onSave: (categoryData: Category) => void
}

export const CategoryDialog = ({
  isOpen,
  onOpenChange,
  mode,
  category,
  onSave,
}: CategoryDialogProps) => {
  const [name, setName] = useState(category?.name || "")
  const [titleStyle, setTitleStyle] = useState<TitleStyle>(category?.titleStyle || TitleStyle.AUTO_NUMBER)
  const [recordDateTime, setRecordDateTime] = useState(category?.recordDateTime ?? true)
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || "Heart")

  useEffect(() => {
    if (category) {
      setName(category.name)
      setTitleStyle(category.titleStyle)
      setRecordDateTime(category.recordDateTime)
      setSelectedIcon(category.icon)
    } else {
      setName("")
      setTitleStyle(TitleStyle.AUTO_NUMBER)
      setRecordDateTime(true)
      setSelectedIcon("Heart")
    }
  }, [category, isOpen])

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        id: category?.id,
        name: name.trim(),
        icon: selectedIcon,
        titleStyle,
        recordDateTime,
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Create New Category" : "Edit Category"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Category name"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="titleStyle" className="text-right">Title Style</Label>
            <Select value={titleStyle} onValueChange={(value: TitleStyle) => setTitleStyle(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select title style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TitleStyle.AUTO_NUMBER}>Auto Number</SelectItem>
                <SelectItem value={TitleStyle.CUSTOM_TITLE}>Custom Title</SelectItem>
                <SelectItem value={TitleStyle.CUSTOM_AND_AUTO}>Custom & Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recordDateTime" className="text-right">Record Date/Time</Label>
            <div className="col-span-3">
              <Checkbox
                id="recordDateTime"
                checked={recordDateTime}
                onCheckedChange={(checked) => setRecordDateTime(checked as boolean)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Icon</Label>
            <div className="col-span-3">
              <RadioGroup value={selectedIcon} onValueChange={setSelectedIcon}>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((option) => {
                    const IconComponent = option.icon || Heart
                    return (
                      <div key={option.name} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.name} id={option.name} className="sr-only" />
                        <Label
                          htmlFor={option.name}
                          className={`flex items-center justify-center w-10 h-10 rounded-md border-2 cursor-pointer transition-colors ${
                            selectedIcon === option.name
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-primary/50"
                          }`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{mode === "new" ? "Create" : "Update"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

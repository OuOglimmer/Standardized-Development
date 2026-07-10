import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Home() {
  return (
    <div className="p-8 space-y-4 max-w-2xl mx-auto">
      {/* Button */}
      <Button>测试按钮</Button>

      {/* Card */}
      <Card>
        <CardHeader>
          <CardTitle>卡片标题</CardTitle>
        </CardHeader>
        <CardContent>
          这是卡片内容，shadcn/ui 正常工作！
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">打开对话框</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>对话框标题</DialogTitle>
            <DialogDescription>
              这是一个对话框的描述文字。
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">下拉菜单</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>选项 1</DropdownMenuItem>
          <DropdownMenuItem>选项 2</DropdownMenuItem>
          <DropdownMenuItem>选项 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
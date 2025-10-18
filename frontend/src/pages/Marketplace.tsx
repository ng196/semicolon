import { useState } from "react";
import { Plus, Search, Filter, Heart, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryBadge } from "@/components/CategoryBadge";
import marketplaceData from "@/data/marketplace.json";

export default function Marketplace() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
              <p className="text-sm text-muted-foreground">
                Buy, sell, and borrow items from your campus community
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              List Item
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all-categories">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-conditions">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-conditions">All Conditions</SelectItem>
                <SelectItem value="new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="price-range">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-range">Price Range</SelectItem>
                <SelectItem value="0-50">$0 - $50</SelectItem>
                <SelectItem value="50-200">$50 - $200</SelectItem>
                <SelectItem value="200+">$200+</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-types">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="borrow">For Borrow</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {marketplaceData.map((item) => (
            <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-lg">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                />
                <button
                  className={`absolute right-2 top-2 rounded-full p-2 ${
                    item.liked
                      ? "bg-red-500 text-white"
                      : "bg-white/90 text-gray-700 hover:bg-white"
                  } transition-colors`}
                >
                  <Heart className={`h-4 w-4 ${item.liked ? "fill-current" : ""}`} />
                </button>
                <div className="absolute left-2 top-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.type === "For Sale"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xl font-bold text-primary">
                    {item.price === 0 ? "Free" : `$${item.price}`}
                  </p>
                </div>

                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {item.description}
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  <CategoryBadge category={item.category} />
                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {item.condition}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.seller.avatar}
                      alt={item.seller.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.seller.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{item.seller.rating}</span>
                      </div>
                    </div>
                  </div>
                  {item.type === "For Sale" ? (
                    <Button size="sm">Contact</Button>
                  ) : (
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      Request
                    </Button>
                  )}
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  Posted {item.postedAt}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing 1-6 of 24 items
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

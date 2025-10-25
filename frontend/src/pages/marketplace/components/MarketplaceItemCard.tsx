import { Heart, MessageCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MarketplaceItem } from '../types';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  onClick: (item: MarketplaceItem) => void;
  onContact: (item: MarketplaceItem) => void;
  onFavorite: (item: MarketplaceItem) => void;
}

export default function MarketplaceItemCard({
  item,
  onClick,
  onContact,
  onFavorite,
}: MarketplaceItemCardProps) {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      new: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      excellent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      good: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      fair: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[condition.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => onClick(item)}>
      <div className="aspect-video bg-muted relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(item);
          }}
          className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
        >
          <Heart className={`h-4 w-4 ${item.liked ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </CardTitle>
          <div className="text-lg font-bold text-primary whitespace-nowrap">
            {formatPrice(item.price)}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {item.type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {item.category}
          </Badge>
          <Badge className={`text-xs ${getConditionColor(item.condition)}`}>
            {item.condition}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={item.seller_avatar} />
              <AvatarFallback>
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">
              {item.seller_name}
            </span>
          </div>
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onContact(item);
            }} 
            className="gap-2 flex-shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

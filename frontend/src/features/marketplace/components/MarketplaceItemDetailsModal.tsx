import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import {
  MessageCircle,
  Heart,
  User,
  Calendar,
  MapPin,
  Star,
} from 'lucide-react';
import { MarketplaceItem } from '../types';

interface MarketplaceItemDetailsModalProps {
  item: MarketplaceItem | null;
  open: boolean;
  onClose: () => void;
  onContact: (item: MarketplaceItem) => void;
  onFavorite: (item: MarketplaceItem) => void;
}

export default function MarketplaceItemDetailsModal({
  item,
  open,
  onClose,
  onContact,
  onFavorite,
}: MarketplaceItemDetailsModalProps) {
  if (!item) return null;

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image Available
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(item.price)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFavorite(item)}
                className="gap-2"
              >
                <Heart
                  className={`h-4 w-4 ${item.liked ? 'fill-red-500 text-red-500' : ''
                    }`}
                />
                {item.liked ? 'Saved' : 'Save'}
              </Button>
              <Button onClick={() => onContact(item)} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact Seller
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{item.type}</Badge>
            <Badge variant="outline">{item.category}</Badge>
            <Badge className={getConditionColor(item.condition)}>
              {item.condition}
            </Badge>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          <Separator />

          {/* Seller Info */}
          <div>
            <h3 className="font-semibold mb-3">Seller Information</h3>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={item.seller_avatar} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{item.seller_name}</p>
                {item.seller_rating && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{item.seller_rating} rating</span>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>
          </div>

          <Separator />

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Posted {item.posted_at}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Campus Pickup</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

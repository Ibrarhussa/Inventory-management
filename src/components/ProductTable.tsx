import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Product } from '../types';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="rounded-xl overflow-x-auto border border-border shadow-lg hover:shadow-xl transition-shadow duration-300 hover:border-primary/30 animate-fade-in text-xs sm:text-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 hover:bg-gradient-to-r hover:from-primary/15 hover:via-secondary/15 hover:to-accent/15 transition-all duration-300">
            <TableHead className="w-6 sm:w-8 md:w-12 font-bold text-foreground text-xs md:text-sm px-1 sm:px-2">#</TableHead>
            <TableHead className="w-8 sm:w-12 md:w-20 font-bold text-foreground text-xs md:text-sm px-1 sm:px-2">Image</TableHead>
            <TableHead className="font-bold text-foreground text-xs md:text-sm px-1 sm:px-2">Name</TableHead>
            <TableHead className="hidden sm:table-cell font-bold text-foreground text-xs md:text-sm px-1 sm:px-2">Price</TableHead>
            <TableHead className="hidden md:table-cell font-bold text-foreground text-xs md:text-sm px-1 sm:px-2">Qty</TableHead>
            <TableHead className="text-right font-bold text-foreground text-xs md:text-sm px-1 sm:px-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={product._id} className="border-border/50 hover:bg-card/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-md animate-slide-in-up" style={{ animationDelay: `${index * 30}ms` }}>
              <TableCell className="font-medium text-muted-foreground text-xs md:text-sm px-1 sm:px-2">{index + 1}</TableCell>
              <TableCell className="px-1 sm:px-2">
                <div className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden border border-border/30 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">No img</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-semibold text-foreground text-xs md:text-sm truncate hover:text-primary transition-colors duration-300 px-1 sm:px-2">{product.name}</TableCell>
              <TableCell className="hidden sm:table-cell font-bold text-primary text-xs md:text-sm px-1 sm:px-2">${product.price}</TableCell>
              <TableCell className="hidden md:table-cell font-semibold text-accent text-xs md:text-sm px-1 sm:px-2">{product.quantity}</TableCell>
              <TableCell className="text-right px-1 sm:px-2">
                <div className="flex gap-0.5 sm:gap-1 md:gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all px-1 sm:px-2 md:px-3 hover:scale-110 duration-200 h-auto py-1"
                  >
                    <Edit className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product._id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all px-1 sm:px-2 md:px-3 hover:scale-110 hover:animate-wobble duration-200 h-auto py-1"
                  >
                    <Trash2 className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

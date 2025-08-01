import React from 'react';
import { List, ListItem, ListItemText, IconButton, Box, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WidgetsIcon from '@mui/icons-material/WidgetsOutlined';

const ProductList = ({ selectedProducts, setSelectedProducts }) => (
  selectedProducts.length > 0 ? (
    <List dense>
      {selectedProducts.map(p => (
        <ListItem key={p.id} secondaryAction={
          <IconButton edge="end" onClick={() => setSelectedProducts(prev => prev.filter(prod => prod.id !== p.id))}>
            <DeleteIcon />
          </IconButton>
        }>
          <ListItemText
            primary={p.name}
            secondary={`Marka: ${p.brand || '-'}, Art: ${p.articleNumber || '-'}, Miktar: ${p.quantity} ${p.unit}`}
          />
        </ListItem>
      ))}
    </List>
  ) : (
    <Box textAlign="center" p={3} sx={{ color: 'text.secondary' }}>
      <WidgetsIcon sx={{ fontSize: 48, mb: 1 }} />
      <Typography>Henüz ürün eklenmedi</Typography>
      <Typography variant="caption">İlk adımdan ürün ekleyebilirsiniz</Typography>
    </Box>
  )
);

export default ProductList;

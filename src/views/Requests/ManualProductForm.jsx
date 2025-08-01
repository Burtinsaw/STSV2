import React, { useState } from 'react';
import { Grid, TextField, Button, Paper, List, ListItem, ListItemText, Box, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const ManualProductForm = ({ manualProduct, setManualProduct, manualProductList, handleAddManualProductToList, addManualListToCart }) => {
  const [errors, setErrors] = useState({});
  const [isAdding, setIsAdding] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!manualProduct.name || manualProduct.name.trim() === '') newErrors.name = 'Ürün adı zorunlu';
    if (!manualProduct.quantity || isNaN(manualProduct.quantity) || Number(manualProduct.quantity) <= 0) newErrors.quantity = 'Miktar pozitif olmalı';
    return newErrors;
  };

  const handleAdd = async () => {
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      setIsAdding(true);
      await new Promise(r => setTimeout(r, 400)); // Simüle yükleme
      handleAddManualProductToList();
      setIsAdding(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            label="Ürün Adı"
            value={manualProduct.name}
            onChange={e => setManualProduct({ ...manualProduct, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isAdding}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth size="small" label="Marka" value={manualProduct.brand} onChange={e => setManualProduct({ ...manualProduct, brand: e.target.value })} disabled={isAdding} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth size="small" label="Artikel No" value={manualProduct.articleNumber} onChange={e => setManualProduct({ ...manualProduct, articleNumber: e.target.value })} disabled={isAdding} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="Miktar"
            type="number"
            value={manualProduct.quantity}
            onChange={e => setManualProduct({ ...manualProduct, quantity: e.target.value })}
            error={!!errors.quantity}
            helperText={errors.quantity}
            disabled={isAdding}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField fullWidth size="small" label="Birim" value={manualProduct.unit} onChange={e => setManualProduct({ ...manualProduct, unit: e.target.value })} disabled={isAdding} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button fullWidth variant="contained" onClick={handleAdd} sx={{ height: '100%' }} disabled={isAdding}>
            {isAdding ? <span style={{ display: 'flex', alignItems: 'center' }}><CircularProgress size={20} sx={{ mr: 1 }} />Ekleniyor...</span> : <><AddIcon /> Talebe Ekle</>}
          </Button>
        </Grid>
      </Grid>
      {manualProductList.length > 0 && (
        <Box mt={2}>
          <List dense>
            {manualProductList.map(p => (
              <ListItem key={p.id}>
                <ListItemText primary={p.name} secondary={`Marka: ${p.brand || '-'}, Artikel: ${p.articleNumber || '-'}, Miktar: ${p.quantity} ${p.unit}`} />
              </ListItem>
            ))}
          </List>
          <Button fullWidth variant="outlined" onClick={addManualListToCart} disabled={isAdding}>Listeyi Talebe Ekle</Button>
        </Box>
      )}
    </Paper>
  );
};

export default ManualProductForm;

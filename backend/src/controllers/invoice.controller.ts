import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabaseClient.js';
import { generateInvoicePDF } from '../services/invoice.service.js';

export const downloadInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(id, quantity, price_at_purchase, price, size, color, products(id, title, price, image_url))')
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const pdfBuffer = await generateInvoicePDF(order, order.order_items || []);
    const refId = order.id.substring(0, 8).toUpperCase();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="JT-Invoice-${refId}.pdf"`);
    res.setHeader('Content-Length', String(pdfBuffer.length));
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('[Invoice] Error generating PDF:', err.message);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
};

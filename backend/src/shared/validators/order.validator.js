// File: backend/src/shared/validators/order.validator.js
// Order validation schemas using Joi

const Joi = require('joi');

/**
 * Validate order creation data
 */
const validateOrder = (data) => {
  const schema = Joi.object({
    customerId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid customer ID format',
        'any.required': 'Customer ID is required'
      }),
    
    tableId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid table ID format',
        'any.required': 'Table ID is required'
      }),
    
    items: Joi.array()
      .min(1)
      .items(
        Joi.object({
          menuItemId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required(),
          quantity: Joi.number()
            .integer()
            .min(1)
            .max(99)
            .default(1),
          customizations: Joi.object().default({}),
          specialInstructions: Joi.string().max(500).allow('')
        })
      )
      .required()
      .messages({
        'array.min': 'Order must contain at least one item',
        'any.required': 'Order items are required'
      }),
    
    notes: Joi.string().max(1000).allow(''),
    specialInstructions: Joi.string().max(1000).allow(''),
    discount: Joi.number().min(0).default(0),
    
    metadata: Joi.object({
      source: Joi.string().valid('tablet', 'web', 'mobile', 'pos').default('tablet'),
      ipAddress: Joi.string().allow(''),
      userAgent: Joi.string().allow(''),
      sessionId: Joi.string().allow('')
    }).default({})
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate order status
 */
const validateOrderStatus = (status) => {
  const schema = Joi.string()
    .valid(
      'pending',
      'confirmed', 
      'preparing',
      'ready',
      'served',
      'completed',
      'cancelled'
    )
    .required()
    .messages({
      'any.only': 'Invalid order status',
      'any.required': 'Status is required'
    });

  return schema.validate(status);
};

/**
 * Validate order update
 */
const validateOrderUpdate = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid(
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'served',
      'completed',
      'cancelled'
    ),
    notes: Joi.string().max(1000),
    paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded')
  }).min(1);

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (id) => {
  const schema = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format'
    });

  return schema.validate(id);
};

module.exports = {
  validateOrder,
  validateOrderStatus,
  validateOrderUpdate,
  validateObjectId
};
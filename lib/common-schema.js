const paramErrorSchema = {
  "title": "paramError",
  "type": "object",
  "properties": {
    "status": {
      "type": "integer"
    },
    "type": {
      "type": "string"
    },
    "path": {
      "type": "string"
    },
    "error": {
      "type": "string"
    },
    "detail": {
      "type": "object"
    }
  }
};

const defaultErrorSchema = {
  "title": "interError",
  "type": "object",
  "properties": {
    "status": {
      "type": "integer"
    },
    "message": {
      "type": "string"
    },
    "stack": {
      "type": "string"
    }
  }
};


const countSchema = {
  "title": "countSchema",
  "type": "object",
  "properties": {
    "count": {
      "type": "number",
      "format": "int32"
    }
  }
}

const multiUpdateSchema = {
  "title": "multiUpdateSchema",
  "type": "object",
  "properties": {
    "ok": {
      "type": "number",
      "format": "int32"
    },
    "nModified": {
      "type": "number",
      "format": "int32"
    },
    "n": {
      "type": "number",
      "format": "int32"
    }
  }
}

export {
  paramErrorSchema,
  defaultErrorSchema,
  countSchema,
  multiUpdateSchema
}

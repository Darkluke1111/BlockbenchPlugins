module.exports = {
  "type": "object",
  "properties": {
    "editor": {
      "$ref": "#/definitions/VS_EditorSettings"
    },
    "textureWidth": {
      "type": "number"
    },
    "textureHeight": {
      "type": "number"
    },
    "textureSizes": {
      "$ref": "#/definitions/Record<string,[number,number]>"
    },
    "textures": {
      "$ref": "#/definitions/Record<string,string>"
    },
    "elements": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/VS_Element"
      }
    },
    "animations": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/VS_Animation"
      }
    }
  },
  "required": [
    "editor",
    "elements",
    "textureHeight",
    "textureSizes",
    "textureWidth",
    "textures"
  ],
  "definitions": {
    "VS_EditorSettings": {
      "type": "object",
      "properties": {
        "collapsedPaths": {
          "type": "string"
        },
        "allAngles": {
          "type": "boolean"
        },
        "entityTextureMode": {
          "type": "boolean"
        }
      }
    },
    "Record<string,[number,number]>": {
      "type": "object"
    },
    "Record<string,string>": {
      "type": "object"
    },
    "VS_Element": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "from": {
          "type": "array",
          "items": [
            {
              "type": "number"
            },
            {
              "type": "number"
            },
            {
              "type": "number"
            }
          ],
          "minItems": 3,
          "maxItems": 3
        },
        "to": {
          "type": "array",
          "items": [
            {
              "type": "number"
            },
            {
              "type": "number"
            },
            {
              "type": "number"
            }
          ],
          "minItems": 3,
          "maxItems": 3
        },
        "autoUnwrap": {
          "type": "boolean"
        },
        "uv": {
          "type": "array",
          "items": [
            {
              "type": "number"
            },
            {
              "type": "number"
            }
          ],
          "minItems": 2,
          "maxItems": 2
        },
        "rotationOrigin": {
          "type": "array",
          "items": [
            {
              "type": "number"
            },
            {
              "type": "number"
            },
            {
              "type": "number"
            }
          ],
          "minItems": 3,
          "maxItems": 3
        },
        "rotationX": {
          "type": "number"
        },
        "rotationY": {
          "type": "number"
        },
        "rotationZ": {
          "type": "number"
        },
        "faces": {
          "$ref": "#/definitions/Partial<Record<VS_Direction,VS_Face>>"
        },
        "stepParentName": {
          "type": "string"
        },
        "children": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/VS_Element"
          }
        }
      },
      "required": [
        "faces",
        "from",
        "name",
        "to",
        "uv"
      ]
    },
    "Partial<Record<VS_Direction,VS_Face>>": {
      "type": "object",
      "properties": {
        "up": {
          "$ref": "#/definitions/VS_Face"
        },
        "north": {
          "$ref": "#/definitions/VS_Face"
        },
        "east": {
          "$ref": "#/definitions/VS_Face"
        },
        "south": {
          "$ref": "#/definitions/VS_Face"
        },
        "west": {
          "$ref": "#/definitions/VS_Face"
        },
        "down": {
          "$ref": "#/definitions/VS_Face"
        }
      }
    },
    "VS_Face": {
      "type": "object",
      "properties": {
        "texture": {
          "type": "string"
        },
        "uv": {
          "type": "array",
          "items": [
            {
              "type": "number"
            },
            {
              "type": "number"
            },
            {
              "type": "number"
            },
            {
              "type": "number"
            }
          ],
          "minItems": 4,
          "maxItems": 4
        },
        "rotation": {
          "type": "number"
        },
        "windMode": {
          "type": "array",
          "items": [
            {
              "type": "number"
            },
            {
              "type": "number"
            },
            {
              "type": "number"
            },
            {
              "type": "number"
            }
          ],
          "minItems": 4,
          "maxItems": 4
        }
      },
      "required": [
        "texture",
        "uv"
      ]
    },
    "VS_Animation": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "code": {
          "type": "string"
        },
        "quantityframes": {
          "type": "number"
        },
        "onActivityStopped": {
          "$ref": "#/definitions/VS_OnActivityStopped"
        },
        "onAnimationEnd": {
          "$ref": "#/definitions/VS_OnAnimationEnd"
        },
        "easeAnimationSpeed": {
          "type": "boolean"
        },
        "keyframes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/VS_Keyframe"
          }
        }
      },
      "required": [
        "code",
        "keyframes",
        "name",
        "onActivityStopped",
        "onAnimationEnd",
        "quantityframes"
      ]
    },
    "VS_OnActivityStopped": {
      "enum": [
        "EaseOut",
        "PlayTillEnd",
        "Rewind",
        "Stop"
      ],
      "type": "string"
    },
    "VS_OnAnimationEnd": {
      "enum": [
        "EaseOut",
        "Hold",
        "Repeat",
        "Stop"
      ],
      "type": "string"
    },
    "VS_Keyframe": {
      "type": "object",
      "properties": {
        "frame": {
          "type": "number"
        },
        "elements": {
          "$ref": "#/definitions/Record<string,Partial<VS_AnimationKey>>"
        }
      },
      "required": [
        "elements",
        "frame"
      ]
    },
    "Record<string,Partial<VS_AnimationKey>>": {
      "type": "object"
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
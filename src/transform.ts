import { vector_equals, vector_sub } from "./util";
import { transform_tree } from "./util/element_tree";
import { VS_Animation, VS_Element, VS_Shape } from "./vs_shape_def";



/**
 * Checks if an element has geometry along with children or attachment points.
 * These elements need hierarchy (group) but also have visual geometry (cube).
 */
export function has_geometry_with_hierarchy(element: VS_Element): boolean {
    return has_geometry(element) && (has_children(element) || has_attachments(element));
}

/**
 * An element is considered to be complex if it has:
 * - geometry with hierarchy (children or attachment points), OR
 * - geometry and is part of an animation
 * Complex elements need to be split into a parent group and a geometry child.
 * @param element Element to test
 * @returns True if the element is complex, false otherwise
 */
export function is_complex(element: VS_Element, animations: VS_Animation[]): boolean {
    return has_geometry_with_hierarchy(element)
        || (has_geometry(element) && has_animation(element, animations));
}

/**
 * Splits all complex elements in an element tree into two simple elements. One element without geometry at the root of the new tree,
 * one element without children as additional child of the first, with shifted from/to values.
 * 
 *                           Parent
 *   Complex                 /  |  \
 *     / \      ===>        /   |   \
 *    A   B                /    |    \
 *                    Geometry  A     B
 * 
 * @param element Element tree with potential complex elements
 * @returns Element tree without any complex elements
 */
export function expand_complex_elements(shape: VS_Shape): VS_Shape {
    shape.elements = shape.elements.map(root => transform_tree(root, (element) => {
        if(is_complex(element, shape.animations || [])) {
            return expand_complex_element(element);
        } else {
            return element;
        }
    }));
    return shape;
}

export function expand_complex_element(complex: VS_Element): VS_Element {
    const new_parent: VS_Element = {
        ...complex, 
        from: complex.from, 
        to: complex.from, 
        faces: undefined, 
        name: `${complex.name}`,
        children: complex.children || [],
    };
    
    const new_geometry: VS_Element = {
        ...complex,
        from: vector_sub(complex.from, complex.from),
        rotationOrigin: vector_sub(complex.from, complex.from),
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        to: vector_sub(complex.to, complex.from),
        stepParentName: undefined,
        attachmentpoints: undefined,
        children: [],
        name: `${complex.name}_geo`
    };
    new_parent.children!.push(new_geometry);

    return new_parent;
}

export function is_simple_group(element: VS_Element): boolean {
    return (has_children(element) || has_attachments(element)) && !has_geometry(element);
}

export function is_simple_cube(element: VS_Element): boolean {
    return !has_children(element) && !has_attachments(element) && has_geometry(element);
}

export function has_children(element: VS_Element): boolean {
    return element.children !== undefined && element.children.length > 0;
}

export function has_attachments(element: VS_Element): boolean {
    return element.attachmentpoints !== undefined && element.attachmentpoints.length > 0;
}

export function has_geometry(element: VS_Element): boolean {
    const has_geometry =  (element.faces !== undefined && Object.keys(element.faces).length > 0) && !vector_equals(element.from, element.to);
    return has_geometry;
}

export function has_animation(element: VS_Element, animations: VS_Animation[]): boolean {
    return animations.some(animation => {
        return animation.keyframes.some(kf => {
            return Object.keys(kf.elements).includes(element.name);
        });
    });
}
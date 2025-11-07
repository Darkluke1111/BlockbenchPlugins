import { vector_equals, vector_sub } from "./util";
import { VS_Element } from "./vs_shape_def";


export function transform_tree(element: VS_Element, transformation: (element: VS_Element) => VS_Element): VS_Element {
    const element_transformed = transformation(element);

    if(element_transformed.children) {
        element_transformed.children = element.children?.map(child => transform_tree(child, transformation));
    }
    return element_transformed;
}


/**
 * An element is considered to be complex if it has children AND geometry attached
 * @param element Element to test
 * @returns True if the element is complex, false otherwise
 */
export function is_complex(element: VS_Element): boolean {
    return has_children(element) && has_geometry(element);
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
export function expand_complex_elements(root: VS_Element): VS_Element {
    return transform_tree(root, (element) => {
        if(is_complex(element)) {
            
            return expand_complex_element(element);
        } else {
            return element;
        }
    });
}

function expand_complex_element(complex: VS_Element): VS_Element {
    const new_parent: VS_Element = {...complex, from: complex.from, to: complex.from, faces: undefined, name: `${complex.name}`};
    const new_geometry: VS_Element = {...complex, from: vector_sub(complex.from, complex.from), to: vector_sub(complex.to, complex.from), children: [], name: `${complex.name}_geo`};

    new_parent.children!.push(new_geometry);

    if(has_geometry(new_parent)) {
        console.log("New parent still has geometry!");
    }
    if(has_children(new_geometry)) {
        console.log("New geometry still has children!");
    }
    return new_parent;
}



export function has_children(element: VS_Element): boolean {
    return element.children !== undefined && element.children.length > 0;
}

export function has_geometry(element: VS_Element): boolean {
    const has_geometry =  (element.faces !== undefined && Object.keys(element.faces).length > 0) && !vector_equals(element.from, element.to);
    return has_geometry;
}
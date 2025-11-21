
import {VS_Element} from "../vs_shape_def";

/**
 * Transforms an element tree by applying a transformation function to each element.
 * @param element The root element to transform.
 * @param transformation The transformation function to apply to each element.
 * @returns The transformed element tree.
 */
export function transform_tree(element: VS_Element, transformation: (element: VS_Element) => VS_Element): VS_Element {
    const element_transformed = transformation(element);

    if(element_transformed.children) {
        element_transformed.children = element_transformed.children?.map(child => transform_tree(child, transformation));
    }
    return element_transformed;
}

/**
 * Visits each element in the tree and applies the visitor function.
 * @param element The root element to visit.
 * @param visitor The visitor function to apply to each element.
 */
export function visit_tree(element: VS_Element, visitor: (element: VS_Element) => void): void {
    visitor(element);

    if(element.children) {
        element.children.forEach(child => visit_tree(child, visitor));
    }
}

/**
 * Collects data from the element tree using the provided data extractor function.
 * @param elements The root elements to collect data from.
 * @param data_extractor The function to extract data from each element.
 * @returns A set of collected data items.
 */
export function collect_tree_data<T>(elements: VS_Element[], data_extractor: (element: VS_Element) => T): Set<T> {
    const collected_data = new Set<T>();
    elements.forEach(element => {
        visit_tree(element, (elem) => {
            collected_data.add(data_extractor(elem));
        });
    });
    return collected_data;
}


export function flatten<T>(setOfSets: Set<Set<T>>): Set<T> {
    const flatSet = new Set<T>();
    setOfSets.forEach(innerSet => {
        innerSet.forEach(item => {
            flatSet.add(item);
        });
    });
    return flatSet;
}